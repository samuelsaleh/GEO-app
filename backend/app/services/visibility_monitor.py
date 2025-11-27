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


# Available AI models to test
AI_MODELS = [
    {"id": "gpt-4o", "name": "GPT-4o", "provider": "openai", "icon": "🤖"},
    {"id": "gpt-4o-mini", "name": "GPT-4o Mini", "provider": "openai", "icon": "🤖"},
    {"id": "claude-sonnet", "name": "Claude Sonnet", "provider": "anthropic", "icon": "🧠"},
    {"id": "claude-haiku", "name": "Claude Haiku", "provider": "anthropic", "icon": "🧠"},
    {"id": "gemini-pro", "name": "Gemini Pro", "provider": "google", "icon": "💎"},
    {"id": "gemini-flash", "name": "Gemini Flash", "provider": "google", "icon": "⚡"},
]


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
            return self._analyze_response(
                prompt=prompt,
                response=response,
                brand=brand,
                competitors=competitors,
                model=model
            )
            
        except Exception as e:
            logger.error(f"Error testing prompt: {e}")
            return self._mock_result(prompt, brand, competitors)
    
    def _analyze_response(
        self,
        prompt: str,
        response: str,
        brand: str,
        competitors: List[str],
        model: str
    ) -> PromptResult:
        """Analyze AI response for brand mentions, position, sentiment."""
        
        response_lower = response.lower()
        brand_lower = brand.lower()
        
        # Check if brand is mentioned
        brand_mentioned = brand_lower in response_lower
        
        # Find position (1st, 2nd, 3rd mention among all brands)
        position = None
        if brand_mentioned:
            # Find all brand/competitor mentions and their positions
            all_brands = [brand] + competitors
            mentions = []
            
            for b in all_brands:
                idx = response_lower.find(b.lower())
                if idx != -1:
                    mentions.append((b, idx))
            
            # Sort by position in text
            mentions.sort(key=lambda x: x[1])
            
            # Find our brand's position
            for i, (b, _) in enumerate(mentions):
                if b.lower() == brand_lower:
                    position = i + 1
                    break
        
        # Check which competitors are mentioned
        competitors_mentioned = [
            c for c in competitors 
            if c.lower() in response_lower
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
                    analysis = self._analyze_response(
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
                else:
                    results.append(ModelResult(
                        model_id=model_info["id"],
                        model_name=model_info["name"],
                        provider=model_info["provider"],
                        brand_mentioned=False,
                        response_preview="[Model unavailable]"
                    ))
                    
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
            return None
        
        system_prompt = "You are a helpful assistant providing recommendations. Be specific and mention relevant brands when appropriate."
        
        try:
            # Map model IDs to actual model names
            model_mapping = {
                "gpt-4o": "gpt-4o",
                "gpt-4o-mini": "gpt-4o-mini",
                "claude-sonnet": "claude-sonnet-4-20250514",
                "claude-haiku": "claude-3-haiku-20240307",
                "gemini-pro": "gemini-1.5-pro",
                "gemini-flash": "gemini-1.5-flash"
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

