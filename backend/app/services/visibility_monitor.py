"""
AI Visibility Monitor Service

Automatically tests prompts across AI models to track brand visibility.
Similar to what Peec AI offers at €89-499/month.
"""

import asyncio
import re
from typing import List, Dict, Optional, Any
from datetime import datetime
import logging
from pydantic import BaseModel

# Import our AI service
try:
    from app.services.ai_service import ai_service
except ImportError:
    ai_service = None

logger = logging.getLogger(__name__)


class PromptResult(BaseModel):
    """Result of a single prompt test"""
    prompt: str
    model: str
    response: str
    brand_mentioned: bool
    position: Optional[int] = None  # 1st, 2nd, 3rd mention, or None
    sentiment: str = "neutral"  # positive, neutral, negative
    competitors_mentioned: List[str] = []
    citations: List[str] = []
    timestamp: datetime = datetime.now()


class VisibilityReport(BaseModel):
    """Aggregated visibility report"""
    brand: str
    total_prompts: int
    mentions: int
    mention_rate: float  # percentage
    avg_position: float
    sentiment_breakdown: Dict[str, int]
    top_competitors: List[Dict[str, Any]]
    model_breakdown: Dict[str, Dict[str, Any]]
    recommendations: List[str]
    timestamp: datetime = datetime.now()


class ModelResult(BaseModel):
    """Result from a specific AI model"""
    model_id: str
    model_name: str
    provider: str
    brand_mentioned: bool
    position: Optional[int] = None
    sentiment: str = "neutral"
    competitors_mentioned: List[str] = []
    response_preview: str = ""  # First 300 chars
    full_response: str = ""


class MultiModelResult(BaseModel):
    """Results from testing across multiple models"""
    prompt: str
    brand: str
    models_tested: int
    models_mentioning: int
    mention_rate: float
    results: List[ModelResult]
    summary: Dict[str, Any]


# Available AI models to test - best from each provider
# FREE tier uses first 2, PAID tier uses all 6
AI_MODELS = [
    # FREE TIER MODELS (first 2)
    {"id": "gpt-5.1", "name": "GPT-5.1", "provider": "openai", "icon": "🤖"},
    {"id": "claude-sonnet-4", "name": "Claude Sonnet 4", "provider": "anthropic", "icon": "🧠"},
    # PAID TIER MODELS (additional 4)
    {"id": "gpt-5.1-mini", "name": "GPT-5.1 Mini", "provider": "openai", "icon": "⚡"},
    {"id": "gemini-2.0-flash", "name": "Gemini 2.0 Flash", "provider": "google", "icon": "💎"},
    {"id": "gemini-1.5-flash", "name": "Gemini 1.5 Flash", "provider": "google", "icon": "✨"},
    {"id": "claude-3.5-sonnet", "name": "Claude 3.5 Sonnet", "provider": "anthropic", "icon": "🎭"},
    {"id": "sonar", "name": "Perplexity Sonar", "provider": "perplexity", "icon": "🔍"},
]

# Model sets for different tiers
FREE_MODELS = ["gpt-5.1", "claude-sonnet-4"]
PAID_MODELS = [m["id"] for m in AI_MODELS]  # All models


class VisibilityMonitor:
    """
    Monitor brand visibility across AI models.
    
    Features:
    - Test custom prompts against multiple AI models
    - Detect brand mentions and position
    - Track competitor mentions
    - Analyze sentiment
    - Generate visibility reports
    """
    
    def __init__(self):
        self.ai_service = ai_service
        self.models = AI_MODELS
        
    async def test_prompt(
        self,
        prompt: str,
        brand: str,
        competitors: List[str] = [],
        model: str = "auto"
    ) -> PromptResult:
        """
        Test a single prompt and analyze the response.
        
        Args:
            prompt: The question to ask the AI
            brand: The brand to look for in the response
            competitors: List of competitor names to track
            model: Which model to use (auto, openai, anthropic, google)
        """
        if not self.ai_service:
            logger.warning("AI service not available, using mock response")
            return self._mock_result(prompt, brand, competitors)
        
        try:
            # Get response from AI
            response = await self.ai_service.generate(
                prompt=prompt,
                system_prompt="You are a helpful assistant providing recommendations and information. Be specific and mention relevant brands, products, or companies when appropriate.",
                max_tokens=1000
            )
            
            if not response:
                return self._mock_result(prompt, brand, competitors)
            
            # Analyze the response
            return await self._analyze_response(
                prompt=prompt,
                response=response,
                brand=brand,
                competitors=competitors,
                model=model
            )
            
        except Exception as e:
            logger.error(f"Error testing prompt: {e}")
            return self._mock_result(prompt, brand, competitors)
    
    def _normalize_for_matching(self, text: str) -> str:
        """Normalize text for fuzzy brand matching."""
        # Convert to lowercase
        text = text.lower()
        # Remove common separators and make uniform
        text = text.replace('-', ' ').replace('_', ' ').replace('.', ' ')
        # Remove extra whitespace
        text = ' '.join(text.split())
        return text
    
    def _brand_in_text(self, brand: str, text: str) -> bool:
        """Check if brand is mentioned in text with fuzzy matching."""
        # Normalize both for comparison
        brand_normalized = self._normalize_for_matching(brand)
        text_normalized = self._normalize_for_matching(text)
        
        # Direct match after normalization
        if brand_normalized in text_normalized:
            return True
        
        # Also check original lowercase (in case normalization breaks something)
        if brand.lower() in text.lower():
            return True
        
        # Check without spaces (e.g., "BasicFit" matches "Basic Fit")
        brand_no_space = brand_normalized.replace(' ', '')
        text_no_space = text_normalized.replace(' ', '')
        if brand_no_space in text_no_space:
            return True
        
        return False
    
    async def _analyze_response(
        self,
        prompt: str,
        response: str,
        brand: str,
        competitors: List[str],
        model: str
    ) -> PromptResult:
        """Analyze AI response for brand mentions, position, sentiment."""
        
        # 1. Try AI-based analysis (More accurate)
        if self.ai_service:
            try:
                analysis = await self.ai_service.analyze_search_result(
                    query=prompt,
                    response_text=response,
                    brand=brand,
                    competitors=competitors
                )
                
                # Extract citations/URLs (regex is still best for this)
                citations = re.findall(r'https?://[^\s<>"{}|\\^`\[\]]+', response)

                return PromptResult(
                    prompt=prompt,
                    model=model,
                    response=response,
                    brand_mentioned=analysis.get("mentioned", False),
                    position=analysis.get("position"),
                    sentiment=analysis.get("sentiment", "neutral"),
                    competitors_mentioned=analysis.get("competitors_found", []),
                    citations=citations
                )
            except Exception as e:
                logger.warning(f"AI analysis failed, falling back to regex: {e}")
        
        # 2. Fallback to Regex/Fuzzy Matching (Fast, free, but less smart)
        response_lower = response.lower()
        brand_lower = brand.lower()
        
        # Check if brand is mentioned (with fuzzy matching)
        brand_mentioned = self._brand_in_text(brand, response)
        
        # Find position (1st, 2nd, 3rd mention among all brands)
        position = None
        if brand_mentioned:
            # Find all brand/competitor mentions and their positions
            all_brands = [brand] + competitors
            mentions = []
            
            response_normalized = self._normalize_for_matching(response)
            
            for b in all_brands:
                b_normalized = self._normalize_for_matching(b)
                idx = response_normalized.find(b_normalized)
                if idx != -1:
                    mentions.append((b, idx))
            
            # Sort by position in text
            mentions.sort(key=lambda x: x[1])
            
            # Find our brand's position
            brand_normalized = self._normalize_for_matching(brand)
            for i, (b, _) in enumerate(mentions):
                if self._normalize_for_matching(b) == brand_normalized:
                    position = i + 1
                    break
        
        # Check which competitors are mentioned (with fuzzy matching)
        competitors_mentioned = [
            c for c in competitors 
            if self._brand_in_text(c, response)
        ]
        
        # Simple sentiment analysis
        sentiment = self._analyze_sentiment(response, brand)
        
        # Extract citations/URLs
        citations = re.findall(r'https?://[^\s<>"{}|\\^`\[\]]+', response)
        
        return PromptResult(
            prompt=prompt,
            model=model,
            response=response,
            brand_mentioned=brand_mentioned,
            position=position,
            sentiment=sentiment,
            competitors_mentioned=competitors_mentioned,
            citations=citations
        )

    
    def _analyze_sentiment(self, response: str, brand: str) -> str:
        """Simple sentiment analysis for brand mentions."""
        response_lower = response.lower()
        brand_lower = brand.lower()
        
        # Find sentences containing the brand
        sentences = response.split('.')
        brand_sentences = [s for s in sentences if brand_lower in s.lower()]
        
        if not brand_sentences:
            return "neutral"
        
        # Positive indicators
        positive_words = [
            'best', 'excellent', 'great', 'top', 'leading', 'recommended',
            'outstanding', 'innovative', 'quality', 'trusted', 'reliable',
            'popular', 'favorite', 'preferred', 'award', 'premium'
        ]
        
        # Negative indicators
        negative_words = [
            'bad', 'poor', 'avoid', 'problem', 'issue', 'complaint',
            'expensive', 'overpriced', 'disappointing', 'lacks', 'limited',
            'controversy', 'criticism', 'negative'
        ]
        
        text = ' '.join(brand_sentences).lower()
        
        positive_count = sum(1 for w in positive_words if w in text)
        negative_count = sum(1 for w in negative_words if w in text)
        
        if positive_count > negative_count:
            return "positive"
        elif negative_count > positive_count:
            return "negative"
        return "neutral"
    
    def _mock_result(
        self,
        prompt: str,
        brand: str,
        competitors: List[str]
    ) -> PromptResult:
        """Return mock result when AI is unavailable."""
        return PromptResult(
            prompt=prompt,
            model="mock",
            response="[AI service unavailable - mock response]",
            brand_mentioned=False,
            position=None,
            sentiment="neutral",
            competitors_mentioned=[],
            citations=[]
        )
    
    async def test_across_models(
        self,
        prompt: str,
        brand: str,
        competitors: List[str] = [],
        models_to_test: List[str] = None
    ) -> MultiModelResult:
        """
        Test a single prompt across multiple AI models.
        
        Returns results from each model showing if brand is mentioned.
        """
        if models_to_test is None:
            models_to_test = [m["id"] for m in self.models]
        
        results: List[ModelResult] = []
        
        for model_info in self.models:
            if model_info["id"] not in models_to_test:
                continue
                
            try:
                # Call the specific model
                response = await self._call_specific_model(
                    prompt=prompt,
                    model_id=model_info["id"],
                    provider=model_info["provider"]
                )
                
                if response:
                    # Analyze the response
                    analysis = await self._analyze_response(
                        prompt=prompt,
                        response=response,
                        brand=brand,
                        competitors=competitors,
                        model=model_info["id"]
                    )
                    
                    results.append(ModelResult(
                        model_id=model_info["id"],
                        model_name=model_info["name"],
                        provider=model_info["provider"],
                        brand_mentioned=analysis.brand_mentioned,
                        position=analysis.position,
                        sentiment=analysis.sentiment,
                        competitors_mentioned=analysis.competitors_mentioned,
                        response_preview=response[:300] + "..." if len(response) > 300 else response,
                        full_response=response
                    ))
                # If the model didn't return anything (e.g. provider not configured),
                # we simply skip adding a result for that model instead of showing
                # a noisy "[Model unavailable]" card in the UI.
                    
            except Exception as e:
                logger.error(f"Error testing {model_info['name']}: {e}")
                results.append(ModelResult(
                    model_id=model_info["id"],
                    model_name=model_info["name"],
                    provider=model_info["provider"],
                    brand_mentioned=False,
                    response_preview=f"[Error: {str(e)[:50]}]"
                ))
            
            # Small delay between models
            await asyncio.sleep(0.3)
        
        # Calculate summary
        models_mentioning = sum(1 for r in results if r.brand_mentioned)
        mention_rate = (models_mentioning / len(results) * 100) if results else 0
        
        # Provider breakdown
        provider_stats = {}
        for r in results:
            if r.provider not in provider_stats:
                provider_stats[r.provider] = {"tested": 0, "mentioned": 0}
            provider_stats[r.provider]["tested"] += 1
            if r.brand_mentioned:
                provider_stats[r.provider]["mentioned"] += 1
        
        return MultiModelResult(
            prompt=prompt,
            brand=brand,
            models_tested=len(results),
            models_mentioning=models_mentioning,
            mention_rate=mention_rate,
            results=results,
            summary={
                "by_provider": provider_stats,
                "best_position": min([r.position for r in results if r.position], default=None),
                "sentiment_summary": {
                    "positive": sum(1 for r in results if r.sentiment == "positive"),
                    "neutral": sum(1 for r in results if r.sentiment == "neutral"),
                    "negative": sum(1 for r in results if r.sentiment == "negative")
                }
            }
        )
    
    async def _call_specific_model(
        self,
        prompt: str,
        model_id: str,
        provider: str
    ) -> Optional[str]:
        """Call a specific AI model."""
        if not self.ai_service:
            logger.warning("AI service not available")
            return None
        
        # Check if provider is configured
        available_providers = self.ai_service.get_available_providers()
        if provider not in available_providers:
            logger.warning(f"Provider '{provider}' not configured. Add API key to .env file.")
            return None
        
        system_prompt = "You are a helpful assistant providing recommendations. Be specific and mention relevant brands when appropriate."
        
        try:
            # Map short IDs to actual API model names
            model_mapping = {
                "gpt-5.1": "gpt-5.1",
                "gpt-5.1-mini": "gpt-5.1-mini",
                "claude-sonnet-4": "claude-sonnet-4-20250514",
                "claude-3.5-sonnet": "claude-3-5-sonnet-20241022",
                "gemini-2.0-flash": "gemini-2.0-flash",
                "gemini-1.5-flash": "gemini-1.5-flash",
                "sonar": "sonar",
            }
            
            actual_model = model_mapping.get(model_id, model_id)
            
            # Use the AI service's generate method with specific provider
            response = await self.ai_service.generate_with_model(
                prompt=prompt,
                system_prompt=system_prompt,
                model=actual_model,
                provider=provider
            )
            return response
            
        except Exception as e:
            logger.error(f"Error calling {model_id}: {e}")
            return None
    
    async def run_visibility_check(
        self,
        brand: str,
        prompts: List[str],
        competitors: List[str] = [],
        models: List[str] = ["auto"]
    ) -> VisibilityReport:
        """
        Run a full visibility check across multiple prompts and models.
        
        Args:
            brand: The brand to track
            prompts: List of prompts to test
            competitors: Competitor brands to track
            models: Which models to test (auto, openai, anthropic, google)
        """
        results: List[PromptResult] = []
        
        for prompt in prompts:
            for model in models:
                result = await self.test_prompt(
                    prompt=prompt,
                    brand=brand,
                    competitors=competitors,
                    model=model
                )
                results.append(result)
                # Small delay to avoid rate limits
                await asyncio.sleep(0.5)
        
        return self._generate_report(brand, results, competitors)
    
    def _generate_report(
        self,
        brand: str,
        results: List[PromptResult],
        competitors: List[str]
    ) -> VisibilityReport:
        """Generate aggregated visibility report from results."""
        
        total = len(results)
        mentions = sum(1 for r in results if r.brand_mentioned)
        mention_rate = (mentions / total * 100) if total > 0 else 0
        
        # Calculate average position (only for mentions)
        positions = [r.position for r in results if r.position is not None]
        avg_position = sum(positions) / len(positions) if positions else 0
        
        # Sentiment breakdown
        sentiment_breakdown = {
            "positive": sum(1 for r in results if r.sentiment == "positive"),
            "neutral": sum(1 for r in results if r.sentiment == "neutral"),
            "negative": sum(1 for r in results if r.sentiment == "negative")
        }
        
        # Competitor analysis
        competitor_counts = {}
        for r in results:
            for c in r.competitors_mentioned:
                competitor_counts[c] = competitor_counts.get(c, 0) + 1
        
        top_competitors = [
            {"name": c, "mentions": count, "rate": count/total*100}
            for c, count in sorted(
                competitor_counts.items(),
                key=lambda x: x[1],
                reverse=True
            )
        ]
        
        # Model breakdown
        model_breakdown = {}
        for r in results:
            if r.model not in model_breakdown:
                model_breakdown[r.model] = {"total": 0, "mentions": 0}
            model_breakdown[r.model]["total"] += 1
            if r.brand_mentioned:
                model_breakdown[r.model]["mentions"] += 1
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            mention_rate, avg_position, sentiment_breakdown, top_competitors
        )
        
        return VisibilityReport(
            brand=brand,
            total_prompts=total,
            mentions=mentions,
            mention_rate=mention_rate,
            avg_position=avg_position,
            sentiment_breakdown=sentiment_breakdown,
            top_competitors=top_competitors,
            model_breakdown=model_breakdown,
            recommendations=recommendations
        )
    
    def _generate_recommendations(
        self,
        mention_rate: float,
        avg_position: float,
        sentiment: Dict[str, int],
        competitors: List[Dict]
    ) -> List[str]:
        """Generate actionable recommendations based on results."""
        recommendations = []
        
        # Mention rate recommendations
        if mention_rate < 20:
            recommendations.append(
                "🔴 Critical: Your brand is mentioned in less than 20% of prompts. "
                "Focus on building authority through schema markup, FAQ content, and external citations."
            )
        elif mention_rate < 50:
            recommendations.append(
                "🟡 Your visibility is below average. Consider adding more structured data "
                "and ensuring your content directly answers common questions."
            )
        else:
            recommendations.append(
                "🟢 Good visibility! Focus on maintaining and improving your position."
            )
        
        # Position recommendations
        if avg_position > 3:
            recommendations.append(
                "📊 You're typically mentioned after competitors. "
                "Improve your E-E-A-T signals and add more unique, authoritative content."
            )
        elif avg_position > 1:
            recommendations.append(
                "📈 You're often mentioned but not first. "
                "Focus on becoming the definitive source in your niche."
            )
        
        # Sentiment recommendations
        total_sentiment = sum(sentiment.values())
        if total_sentiment > 0:
            negative_rate = sentiment.get("negative", 0) / total_sentiment
            if negative_rate > 0.2:
                recommendations.append(
                    "⚠️ Negative sentiment detected in AI responses. "
                    "Review your online reputation and address common complaints."
                )
        
        # Competitor recommendations
        if competitors and competitors[0].get("rate", 0) > 50:
            top_comp = competitors[0]["name"]
            recommendations.append(
                f"👀 {top_comp} appears in {competitors[0]['rate']:.0f}% of responses. "
                f"Analyze their content strategy and identify gaps you can fill."
            )
        
        return recommendations
    
    async def generate_smart_prompts(
        self,
        brand: str,
        competitors: List[str] = [],
        industry: str = "default",
        count: int = 6
    ) -> List[Dict[str, str]]:
        """
        Generate smart prompts based on brand and competitors using AI.
        Returns prompts with categories.
        
        6-Category Framework:
        - 5 categories are UNBIASED (test organic visibility)
        - 1 category (Comparison) INCLUDES all brands (test positioning)
        """
        # Build brand lists
        comp_list = ', '.join(competitors[:3]) if competitors else f'leading {industry} options'
        all_brands = ', '.join([brand] + competitors[:3]) if brand else comp_list
        
        # First try to generate with AI
        if self.ai_service:
            try:
                # Use the new specialized method in ai_service
                questions = await self.ai_service.generate_search_questions(
                    brand=brand,
                    industry=industry,
                    competitors=competitors,
                    count=count
                )
                
                if questions:
                    # Map the new format to the expected format
                    # ai_service returns: [{"query": "...", "intent": "...", "rationale": "..."}]
                    # we need: [{"prompt": "...", "category": "..."}]
                    return [
                        {
                            "prompt": q.get("query", ""),
                            "category": q.get("intent", "general")
                        }
                        for q in questions
                    ]
            except Exception as e:
                logger.warning(f"AI prompt generation failed: {e}")
                # Fallthrough to template based

        
        # Fallback to template-based prompts
        return self._get_template_prompts(brand, competitors, industry, count)
    
    def _get_template_prompts(
        self,
        brand: str,
        competitors: List[str],
        industry: str,
        count: int = 6
    ) -> List[Dict[str, str]]:
        """
        Generate template-based prompts as fallback.
        
        6-Category Framework:
        - 5 categories are UNBIASED (test organic visibility)
        - 1 category (Comparison) INCLUDES all brands (test positioning)
        """
        
        # Build competitor list (without brand)
        comp_list = ", ".join(competitors[:3]) if competitors else f"leading {industry} options"
        
        # Build ALL brands list (including user's brand) for comparison
        all_brands = ", ".join([brand] + competitors[:3]) if brand else comp_list
        
        year = 2024
        
        templates = {
            "jewelry": [
                {"prompt": "What are the best luxury jewelry brands?", "category": "recommendation"},
                {"prompt": "What are the top jewelry brands for engagement rings in 2024?", "category": "best_of"},
                {"prompt": f"Compare {all_brands}. What are the pros and cons of each jewelry brand?", "category": "comparison"},
                {"prompt": f"I like {comp_list}. Are there other luxury jewelry brands I should consider?", "category": "alternatives"},
                {"prompt": "I want to buy a quality engagement ring. What brands should I look at?", "category": "problem_solution"},
                {"prompt": "Which jewelry brands have the best reputation for quality and craftsmanship?", "category": "reputation"},
            ],
            "saas": [
                {"prompt": f"What {industry} software do you recommend for small businesses?", "category": "recommendation"},
                {"prompt": f"What is the best {industry} solution in {year}?", "category": "best_of"},
                {"prompt": f"Compare {all_brands}. Which {industry} tool is best and why?", "category": "comparison"},
                {"prompt": f"I'm considering {comp_list}. Are there better {industry} alternatives?", "category": "alternatives"},
                {"prompt": f"I need {industry} for my team. What are my options?", "category": "problem_solution"},
                {"prompt": f"Which {industry} tools have the best reputation for reliability?", "category": "reputation"},
            ],
            "ecommerce": [
                {"prompt": f"What are the best online stores for {industry}?", "category": "recommendation"},
                {"prompt": f"What are the top {industry} sites in {year}?", "category": "best_of"},
                {"prompt": f"Compare {all_brands}. Which offers the best value?", "category": "comparison"},
                {"prompt": f"I know about {comp_list}. Are there other {industry} sites I should check?", "category": "alternatives"},
                {"prompt": f"I want to buy {industry} products online. Where should I shop?", "category": "problem_solution"},
                {"prompt": f"Which {industry} stores are most trustworthy?", "category": "reputation"},
            ],
            "default": [
                {"prompt": f"What {industry} brands do you recommend?", "category": "recommendation"},
                {"prompt": f"What is the best {industry} option in the market right now?", "category": "best_of"},
                {"prompt": f"Compare {all_brands}. What are the key differences?", "category": "comparison"},
                {"prompt": f"I'm looking at {comp_list}. Are there better alternatives?", "category": "alternatives"},
                {"prompt": f"I'm looking for {industry}. What are my best options?", "category": "problem_solution"},
                {"prompt": f"Which {industry} brands have the best reputation?", "category": "reputation"},
            ]
        }
        
        prompts = templates.get(industry.lower(), templates["default"])
        return prompts[:count]
    
    async def run_comprehensive_test(
        self,
        brand: str,
        competitors: List[str] = [],
        industry: str = "default",
        num_prompts: int = 5
    ) -> Dict[str, Any]:
        """
        Run comprehensive visibility test:
        - Generate 5 smart prompts
        - Test each prompt across all 6 models
        - Return detailed matrix of results
        """
        # Generate prompts
        prompts = await self.generate_smart_prompts(
            brand=brand,
            competitors=competitors,
            industry=industry,
            count=num_prompts
        )
        
        # Test each prompt across all models
        all_results = []
        prompt_summaries = []
        
        for prompt_data in prompts:
            prompt_text = prompt_data.get("prompt", prompt_data) if isinstance(prompt_data, dict) else prompt_data
            category = prompt_data.get("category", "general") if isinstance(prompt_data, dict) else "general"
            
            result = await self.test_across_models(
                prompt=prompt_text,
                brand=brand,
                competitors=competitors
            )
            
            prompt_summaries.append({
                "prompt": prompt_text,
                "category": category,
                "models_mentioning": result.models_mentioning,
                "models_tested": result.models_tested,
                "mention_rate": result.mention_rate,
                "results": [
                    {
                        "model_id": r.model_id,
                        "model_name": r.model_name,
                        "provider": r.provider,
                        "mentioned": r.brand_mentioned,
                        "position": r.position,
                        "sentiment": r.sentiment
                    }
                    for r in result.results
                ]
            })
            
            all_results.extend(result.results)
        
        # Calculate overall stats
        total_tests = len(all_results)
        total_mentions = sum(1 for r in all_results if r.brand_mentioned)
        overall_rate = (total_mentions / total_tests * 100) if total_tests > 0 else 0
        
        # Model performance
        model_stats = {}
        for r in all_results:
            if r.model_id not in model_stats:
                model_stats[r.model_id] = {"name": r.model_name, "provider": r.provider, "total": 0, "mentions": 0}
            model_stats[r.model_id]["total"] += 1
            if r.brand_mentioned:
                model_stats[r.model_id]["mentions"] += 1
        
        # Best/worst prompts
        sorted_prompts = sorted(prompt_summaries, key=lambda x: x["mention_rate"], reverse=True)
        
        return {
            "brand": brand,
            "competitors": competitors,
            "industry": industry,
            "total_tests": total_tests,
            "total_mentions": total_mentions,
            "overall_visibility": overall_rate,
            "prompts_tested": len(prompts),
            "models_tested": len(self.models),
            "prompt_results": prompt_summaries,
            "model_performance": [
                {
                    "model_id": mid,
                    "model_name": stats["name"],
                    "provider": stats["provider"],
                    "mentions": stats["mentions"],
                    "total": stats["total"],
                    "rate": (stats["mentions"] / stats["total"] * 100) if stats["total"] > 0 else 0
                }
                for mid, stats in model_stats.items()
            ],
            "best_prompt": sorted_prompts[0] if sorted_prompts else None,
            "worst_prompt": sorted_prompts[-1] if sorted_prompts else None,
            "matrix": self._build_visibility_matrix(prompt_summaries)
        }
    
    def _build_visibility_matrix(self, prompt_summaries: List[Dict]) -> Dict[str, Any]:
        """Build a matrix of prompts × models for visualization."""
        if not prompt_summaries:
            return {"rows": [], "columns": []}
        
        # Get model columns from first result
        columns = []
        if prompt_summaries[0].get("results"):
            columns = [r["model_name"] for r in prompt_summaries[0]["results"]]
        
        rows = []
        for ps in prompt_summaries:
            row = {
                "prompt": ps["prompt"][:50] + "..." if len(ps["prompt"]) > 50 else ps["prompt"],
                "category": ps["category"],
                "cells": [r["mentioned"] for r in ps.get("results", [])]
            }
            rows.append(row)
        
        return {
            "columns": columns,
            "rows": rows
        }
    
    def get_default_prompts(self, industry: str, brand: str) -> List[str]:
        """Generate default prompts for common industries."""
        
        prompts = {
            "jewelry": [
                f"What are the best luxury jewelry brands?",
                f"Best diamond jewelry brands in Europe",
                f"Where to buy high-quality diamond bracelets?",
                f"Top sustainable jewelry brands",
                f"Best jewelry brands for engagement rings",
                f"Recommended jewelry brands for gifts",
                f"{brand} vs competitors - which is better?",
                f"Is {brand} a good jewelry brand?",
                f"Best places to buy fine jewelry online",
                f"Luxury jewelry brands with ethical sourcing"
            ],
            "saas": [
                f"Best {industry} software tools",
                f"Top {industry} platforms for businesses",
                f"Recommended {industry} solutions",
                f"{brand} alternatives and competitors",
                f"Is {brand} worth it?",
                f"Best tools for {industry} in 2025"
            ],
            "ecommerce": [
                f"Best online stores for {industry}",
                f"Where to buy {industry} products online",
                f"Top {industry} brands",
                f"Best {industry} websites",
                f"{brand} reviews - is it legit?"
            ],
            "default": [
                f"Best {industry} companies",
                f"Top {industry} brands to consider",
                f"Recommended {industry} services",
                f"{brand} review - pros and cons",
                f"Is {brand} good for {industry}?",
                f"Best alternatives to {brand}",
                f"Top rated {industry} providers",
                f"Where to find quality {industry}",
                f"{brand} vs competitors comparison",
                f"Most trusted {industry} brands"
            ]
        }
        
        return prompts.get(industry.lower(), prompts["default"])


# Singleton instance
visibility_monitor = VisibilityMonitor()

