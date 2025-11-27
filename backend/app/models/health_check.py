from pydantic import BaseModel, HttpUrl, EmailStr
from typing import List, Optional, Dict, Any


class CompetitorInput(BaseModel):
    """Competitor provided by user"""
    name: str
    url: HttpUrl


class HealthCheckRequest(BaseModel):
    """Request for health check analysis"""
    company_name: str
    contact_email: EmailStr
    page_urls: List[HttpUrl]
    questions: List[str]
    # Competitor analysis options
    competitors: Optional[List[CompetitorInput]] = None  # User-provided competitors
    auto_discover_competitors: bool = False  # Let AI find competitors
    industry_keywords: Optional[List[str]] = None  # Help AI find better competitors


class CategoryScore(BaseModel):
    """Score breakdown by category"""
    structure: int = 0      # /25
    schema: int = 0         # /20
    citability: int = 0     # /20
    authority: int = 0      # /15
    freshness: int = 0      # /10
    accessibility: int = 0  # /10


class PageAnalysis(BaseModel):
    """Analysis of a single page"""
    url: str
    score: int
    grade: str = "C"
    has_schema: bool
    has_faq: bool
    readability_score: float
    page_speed: float
    issues: List[str]
    strengths: List[str]
    # Category breakdown
    category_scores: Optional[CategoryScore] = None


class CompetitorAnalysis(BaseModel):
    """Analysis of a competitor"""
    name: str
    url: str
    score: int
    grade: str = "C"
    difference: int  # vs user score (positive = user is better)
    status: str  # "ahead", "behind", "tied"
    has_schema: bool
    has_faq: bool
    top_strengths: List[str]
    ai_discovered: bool = False
    discovery_reason: Optional[str] = None
    # Category breakdown for comparison
    category_scores: Optional[CategoryScore] = None


class CategoryComparison(BaseModel):
    """Category-by-category comparison"""
    category: str
    max_points: int
    user_score: int
    competitor_avg: float
    best_competitor: str
    best_score: int
    user_status: str  # "winning", "losing", "tied"
    gap: float  # difference from best


class CompetitorComparison(BaseModel):
    """Comprehensive comparison between user and competitors"""
    user_score: int
    user_grade: str
    avg_competitor_score: float
    competitors: List[CompetitorAnalysis]
    ranking: int  # User's rank (1 = best)
    total_analyzed: int
    # Category-by-category breakdown
    category_comparison: List[CategoryComparison]
    # Actionable insights
    insights: List[str]
    opportunities: List[str]
    winning_categories: List[str]
    losing_categories: List[str]


class HealthCheckResult(BaseModel):
    """Complete health check result"""
    overall_score: int
    grade: str = "C"
    total_pages: int
    pages_analyzed: List[PageAnalysis]
    top_issues: List[str]
    top_strengths: List[str]
    recommendations: List[str]
    ai_visibility: Dict[str, bool]  # Which AI engines mention the site
    # Category breakdown
    category_scores: Optional[CategoryScore] = None
    # Competitor comparison
    competitor_comparison: Optional[CompetitorComparison] = None
