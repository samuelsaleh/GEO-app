"""Tests for competitor_analyzer.py"""
import pytest
from unittest.mock import Mock, AsyncMock, patch, MagicMock, PropertyMock
import json
import httpx
from app.services.competitor_analyzer import (
    CompetitorAnalyzer,
    CompetitorDiscoveryResult,
    CompetitorSuggestion,
    CompanySize,
    competitor_analyzer
)


@pytest.fixture
def mock_ai_service():
    """Mock AI service"""
    mock = MagicMock()
    type(mock).is_available = PropertyMock(return_value=True)
    mock.get_available_providers.return_value = ["anthropic", "google"]
    mock.analyze_competitors = AsyncMock(return_value=[])
    mock.generate_with_model = AsyncMock(return_value=None)
    mock.generate = AsyncMock(return_value=None)
    return mock


@pytest.fixture
def analyzer(mock_ai_service):
    """Create a CompetitorAnalyzer instance for testing with mocked AI"""
    with patch('app.services.competitor_analyzer.ai_service', mock_ai_service):
        analyzer_instance = CompetitorAnalyzer()
        yield analyzer_instance


class TestCompetitorAnalyzer:
    """Test CompetitorAnalyzer class"""

    def test_initialization(self, analyzer):
        """Test analyzer initializes correctly"""
        assert analyzer.ai is not None
        assert hasattr(analyzer, 'ai')

    @pytest.mark.asyncio
    async def test_discover_competitors_no_ai_available(self, analyzer, mock_ai_service):
        """Test discover_competitors when AI is not available"""
        type(mock_ai_service).is_available = PropertyMock(return_value=False)
        result = await analyzer.discover_competitors(
            company_name="Test Company",
            website_url="https://example.com"
        )
        assert result == []

    @pytest.mark.asyncio
    async def test_discover_competitors_success(self, analyzer, mock_ai_service):
        """Test successful competitor discovery"""
        expected_competitors = [
            {"name": "Competitor 1", "url": "https://competitor1.com"},
            {"name": "Competitor 2", "url": "https://competitor2.com"}
        ]

        mock_ai_service.analyze_competitors = AsyncMock(return_value=expected_competitors)

        with patch.object(analyzer, '_extract_business_context', AsyncMock(return_value="Business context")):
            result = await analyzer.discover_competitors(
                company_name="Test Company",
                website_url="https://example.com"
            )

            assert result == expected_competitors
            assert len(result) == 2
            mock_ai_service.analyze_competitors.assert_called_once()

    @pytest.mark.asyncio
    async def test_discover_top_competitors_no_ai(self, analyzer, mock_ai_service):
        """Test discover_top_competitors when AI is unavailable"""
        type(mock_ai_service).is_available = PropertyMock(return_value=False)
        result = await analyzer.discover_top_competitors(
            brand="Test Brand",
            category="Fashion",
            location="France"
        )

        assert isinstance(result, CompetitorDiscoveryResult)
        assert result.brand == "Test Brand"
        assert result.category == "Fashion"
        assert result.location == "France"
        assert result.total_found == 0
        assert len(result.local_competitors) == 0
        assert len(result.global_competitors) == 0

    @pytest.mark.asyncio
    async def test_discover_top_competitors_with_claude(self, analyzer, mock_ai_service):
        """Test discover_top_competitors using Claude"""
        mock_response = json.dumps({
            "local_competitors": [
                {
                    "name": "Local Competitor 1",
                    "website": "https://local1.com",
                    "reason": "Similar products in France"
                }
            ],
            "global_competitors": [
                {
                    "name": "Global Competitor 1",
                    "website": "https://global1.com",
                    "reason": "International brand in same category"
                }
            ]
        })

        mock_ai_service.generate_with_model = AsyncMock(return_value=mock_response)

        result = await analyzer.discover_top_competitors(
            brand="Test Brand",
            category="Fashion",
            location="France"
        )

        assert isinstance(result, CompetitorDiscoveryResult)
        assert result.brand == "Test Brand"
        assert result.total_found == 2
        assert len(result.local_competitors) == 1
        assert len(result.global_competitors) == 1
        assert result.local_competitors[0].name == "Local Competitor 1"
        assert result.global_competitors[0].name == "Global Competitor 1"

    @pytest.mark.asyncio
    async def test_discover_top_competitors_with_gemini_fallback(self, analyzer, mock_ai_service):
        """Test discover_top_competitors falls back to Gemini when Claude fails"""
        mock_response = json.dumps({
            "local_competitors": [],
            "global_competitors": [
                {
                    "name": "Competitor via Gemini",
                    "website": "https://gemini-competitor.com",
                    "reason": "Found via Gemini fallback"
                }
            ]
        })

        # Claude fails, Gemini succeeds
        async def mock_generate_with_model(*args, **kwargs):
            if kwargs.get('provider') == 'anthropic':
                raise Exception("Claude failed")
            elif kwargs.get('provider') == 'google':
                return mock_response
            return None

        mock_ai_service.generate_with_model = AsyncMock(side_effect=mock_generate_with_model)

        result = await analyzer.discover_top_competitors(
            brand="Test Brand",
            category="Tech"
        )

        assert result.total_found == 1
        assert len(result.global_competitors) == 1
        assert result.global_competitors[0].name == "Competitor via Gemini"

    @pytest.mark.asyncio
    async def test_discover_top_competitors_all_providers_fail(self, analyzer, mock_ai_service):
        """Test discover_top_competitors when all providers fail"""
        mock_ai_service.generate_with_model = AsyncMock(side_effect=Exception("All providers failed"))
        mock_ai_service.generate = AsyncMock(return_value=None)

        result = await analyzer.discover_top_competitors(
            brand="Test Brand",
            category="Tech"
        )

        assert result.total_found == 0
        assert len(result.local_competitors) == 0
        assert len(result.global_competitors) == 0

    def test_parse_competitor_response_valid_json(self, analyzer):
        """Test parsing valid JSON response"""
        response = json.dumps({
            "local_competitors": [
                {"name": "Local 1", "website": "https://local1.com", "reason": "Local competitor"}
            ],
            "global_competitors": [
                {"name": "Global 1", "website": "https://global1.com", "reason": "Global competitor"}
            ]
        })

        result = analyzer._parse_competitor_response(
            response, "Test Brand", "Fashion", "France"
        )

        assert result.total_found == 2
        assert len(result.local_competitors) == 1
        assert len(result.global_competitors) == 1
        assert result.local_competitors[0].scope == "local"
        assert result.global_competitors[0].scope == "global"

    def test_parse_competitor_response_with_markdown(self, analyzer):
        """Test parsing JSON wrapped in markdown code blocks"""
        response = """```json
{
    "local_competitors": [
        {"name": "Local 1", "website": "https://local1.com", "reason": "Local"}
    ],
    "global_competitors": []
}
```"""

        result = analyzer._parse_competitor_response(
            response, "Test Brand", "Fashion", None
        )

        assert result.total_found == 1
        assert len(result.local_competitors) == 1

    def test_parse_competitor_response_empty_competitors(self, analyzer):
        """Test parsing response with empty competitor arrays"""
        response = json.dumps({
            "local_competitors": [],
            "global_competitors": []
        })

        result = analyzer._parse_competitor_response(
            response, "Test Brand", "Fashion", None
        )

        assert result.total_found == 0
        assert len(result.local_competitors) == 0
        assert len(result.global_competitors) == 0

    def test_parse_competitor_response_null_website(self, analyzer):
        """Test parsing response with null websites"""
        response = json.dumps({
            "local_competitors": [
                {"name": "Local 1", "website": "null", "reason": "Unknown website"}
            ],
            "global_competitors": []
        })

        result = analyzer._parse_competitor_response(
            response, "Test Brand", "Fashion", None
        )

        assert result.local_competitors[0].website is None

    def test_parse_competitor_response_invalid_json(self, analyzer):
        """Test parsing invalid JSON returns empty result"""
        response = "This is not valid JSON"

        result = analyzer._parse_competitor_response(
            response, "Test Brand", "Fashion", None
        )

        assert result.total_found == 0
        assert len(result.local_competitors) == 0
        assert len(result.global_competitors) == 0

    def test_parse_competitor_response_missing_names(self, analyzer):
        """Test that competitors without names are skipped"""
        response = json.dumps({
            "local_competitors": [
                {"name": "", "website": "https://example.com", "reason": "Empty name"},
                {"website": "https://example2.com", "reason": "No name field"},
                {"name": "Valid Name", "website": "https://valid.com", "reason": "Valid"}
            ],
            "global_competitors": []
        })

        result = analyzer._parse_competitor_response(
            response, "Test Brand", "Fashion", None
        )

        assert result.total_found == 1
        assert len(result.local_competitors) == 1
        assert result.local_competitors[0].name == "Valid Name"

    @pytest.mark.asyncio
    async def test_extract_business_context_success(self, analyzer):
        """Test successful business context extraction"""
        html_content = """
        <html>
            <head>
                <title>Test Company - Fashion</title>
                <meta name="description" content="We sell amazing fashion products">
            </head>
            <body>
                <h1>Welcome to Test Company</h1>
                <p>We are a leading fashion brand.</p>
            </body>
        </html>
        """

        mock_response = Mock()
        mock_response.text = html_content
        mock_response.raise_for_status = Mock()

        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(return_value=mock_response)

            context = await analyzer._extract_business_context("https://example.com")

            assert "Test Company - Fashion" in context
            assert "We sell amazing fashion products" in context
            assert "Welcome to Test Company" in context

    @pytest.mark.asyncio
    async def test_extract_business_context_failure(self, analyzer):
        """Test business context extraction when request fails"""
        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                side_effect=httpx.RequestError("Connection failed")
            )

            context = await analyzer._extract_business_context("https://example.com")

            assert context == "Website: https://example.com"

    def test_generate_comparison_report_user_ahead(self, analyzer):
        """Test comparison report when user is ahead of competitors"""
        user_analysis = {
            "overall_score": 85,
            "has_schema": True,
            "has_faq": True
        }

        competitor_analyses = [
            {
                "name": "Competitor 1",
                "url": "https://comp1.com",
                "overall_score": 70,
                "has_schema": False,
                "has_faq": True,
                "top_strengths": ["Good content", "Fast loading"]
            },
            {
                "name": "Competitor 2",
                "url": "https://comp2.com",
                "overall_score": 75,
                "has_schema": True,
                "has_faq": False,
                "top_strengths": ["Nice design"]
            }
        ]

        report = analyzer.generate_comparison_report(user_analysis, competitor_analyses)

        assert report["user_score"] == 85
        assert report["ranking"] == 1
        assert report["total_analyzed"] == 3
        assert len(report["competitors"]) == 2
        assert report["competitors"][0]["status"] == "ahead"
        assert report["competitors"][1]["status"] == "ahead"
        assert "🏆" in report["insights"][1]

    def test_generate_comparison_report_user_behind(self, analyzer):
        """Test comparison report when user is behind competitors"""
        user_analysis = {
            "overall_score": 60,
            "has_schema": False,
            "has_faq": False
        }

        competitor_analyses = [
            {
                "name": "Competitor 1",
                "url": "https://comp1.com",
                "overall_score": 80,
                "has_schema": True,
                "has_faq": True,
                "top_strengths": ["Great SEO"]
            }
        ]

        report = analyzer.generate_comparison_report(user_analysis, competitor_analyses)

        assert report["user_score"] == 60
        assert report["ranking"] == 2
        assert report["competitors"][0]["status"] == "behind"
        assert len(report["opportunities"]) >= 2
        assert any("schema markup" in opp for opp in report["opportunities"])
        assert any("FAQ" in opp for opp in report["opportunities"])

    def test_generate_comparison_report_tied(self, analyzer):
        """Test comparison report when user is tied with competitor"""
        user_analysis = {
            "overall_score": 75,
            "has_schema": True,
            "has_faq": True
        }

        competitor_analyses = [
            {
                "name": "Competitor 1",
                "url": "https://comp1.com",
                "overall_score": 75,
                "has_schema": True,
                "has_faq": True,
                "top_strengths": []
            }
        ]

        report = analyzer.generate_comparison_report(user_analysis, competitor_analyses)

        assert report["competitors"][0]["status"] == "tied"
        assert report["competitors"][0]["difference"] == 0

    def test_generate_comparison_report_ranking_calculation(self, analyzer):
        """Test correct ranking calculation"""
        user_analysis = {"overall_score": 70}

        competitor_analyses = [
            {"name": "Comp 1", "url": "c1.com", "overall_score": 80},
            {"name": "Comp 2", "url": "c2.com", "overall_score": 60},
            {"name": "Comp 3", "url": "c3.com", "overall_score": 90}
        ]

        report = analyzer.generate_comparison_report(user_analysis, competitor_analyses)

        # User score 70 should rank 3rd (90, 80, 70, 60)
        assert report["ranking"] == 3
        assert report["total_analyzed"] == 4


class TestDataModels:
    """Test Pydantic models"""

    def test_company_size_model(self):
        """Test CompanySize model"""
        size = CompanySize(
            category="small",
            description="10-50 employees",
            estimated_employees="10-50",
            estimated_revenue="€2M-€10M"
        )

        assert size.category == "small"
        assert size.description == "10-50 employees"
        assert size.estimated_employees == "10-50"
        assert size.estimated_revenue == "€2M-€10M"

    def test_competitor_suggestion_model(self):
        """Test CompetitorSuggestion model"""
        suggestion = CompetitorSuggestion(
            name="Test Competitor",
            website="https://test.com",
            scope="global",
            reason="Similar products"
        )

        assert suggestion.name == "Test Competitor"
        assert suggestion.website == "https://test.com"
        assert suggestion.scope == "global"
        assert suggestion.reason == "Similar products"
        assert suggestion.company_size is None

    def test_competitor_discovery_result_model(self):
        """Test CompetitorDiscoveryResult model"""
        result = CompetitorDiscoveryResult(
            brand="Test Brand",
            category="Fashion",
            location="France",
            total_found=5
        )

        assert result.brand == "Test Brand"
        assert result.category == "Fashion"
        assert result.location == "France"
        assert result.total_found == 5
        assert result.local_competitors == []
        assert result.global_competitors == []
        assert result.size_breakdown == {}


class TestSingletonInstance:
    """Test the singleton instance"""

    def test_competitor_analyzer_singleton(self):
        """Test that competitor_analyzer singleton is initialized"""
        assert competitor_analyzer is not None
        assert isinstance(competitor_analyzer, CompetitorAnalyzer)
        assert hasattr(competitor_analyzer, 'ai')
