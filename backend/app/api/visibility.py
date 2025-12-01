"""
AI Visibility Monitoring API

Endpoints for tracking brand visibility across AI models.
"""

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional
import logging
import time
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.services.visibility_monitor import visibility_monitor, VisibilityReport, PromptResult, MultiModelResult, AI_MODELS, FREE_MODELS, PAID_MODELS
from app.database import SessionLocal
from app.models.database import VisibilityTest
from app.services.speed_test import speed_test_service
from app.services.brand_analyzer import brand_analyzer
from app.services.website_analyzer import website_analyzer
from app.services.email_service import email_service
from app.models.speed_test import (
    ScoreRequest, ScoreResponse, 
    AnalyzeSiteRequest, AnalyzeSiteResponse,
    BrandContext
)
from app.models.brand_profile import (
    BrandProfile,
    BrandAnalysisRequest,
    BrandAnalysisResponse,
    PromptWithCategory,
    TopicCluster,
    CompetitorInfo
)
from app.services.competitor_analyzer import competitor_analyzer, CompetitorDiscoveryResult

router = APIRouter()
logger = logging.getLogger(__name__)
limiter = Limiter(key_func=get_remote_address)


class SinglePromptRequest(BaseModel):
    """Request to test a single prompt"""
    prompt: str
    brand: str
    competitors: List[str] = []
    model: str = "auto"


class VisibilityCheckRequest(BaseModel):
    """Request for full visibility check"""
    brand: str
    prompts: Optional[List[str]] = None  # If None, use defaults
    competitors: List[str] = []
    industry: str = "default"
    models: List[str] = ["auto"]


class QuickCheckRequest(BaseModel):
    """Quick check with minimal input"""
    brand: str
    website_url: str
    competitors: List[str] = []
    industry: str = "default"


class MultiModelRequest(BaseModel):
    """Request to test across multiple AI models"""
    prompt: str
    brand: str
    competitors: List[str] = []
    models: Optional[List[str]] = None  # None = all models


class ComprehensiveTestRequest(BaseModel):
    """Request for comprehensive visibility test"""
    brand: str
    competitors: List[str] = []
    industry: str = "default"
    num_prompts: int = 5


@router.get("/models")
async def get_available_models():
    """Get list of available AI models for testing"""
    return {
        "models": AI_MODELS,
        "total": len(AI_MODELS),
        "providers": ["openai", "anthropic", "google", "perplexity"]
    }


@router.get("/status")
async def get_api_status():
    """
    Check which AI providers are properly configured.
    
    Returns which API keys are set up and working.
    Useful for debugging when models aren't responding.
    """
    from app.services.ai_service import ai_service
    
    available = ai_service.get_available_providers() if ai_service else []
    
    providers_status = {
        "openai": {
            "configured": "openai" in available,
            "models": ["GPT-5.1", "GPT-5.1 Mini"],
            "get_key_url": "https://platform.openai.com/api-keys"
        },
        "anthropic": {
            "configured": "anthropic" in available,
            "models": ["Claude Sonnet 4", "Claude 3.5 Sonnet"],
            "get_key_url": "https://console.anthropic.com/"
        },
        "google": {
            "configured": "google" in available,
            "models": ["Gemini 2.0 Flash", "Gemini 1.5 Flash"],
            "get_key_url": "https://makersuite.google.com/app/apikey"
        },
        "perplexity": {
            "configured": "perplexity" in available,
            "models": ["Sonar", "Sonar Pro"],
            "get_key_url": "https://www.perplexity.ai/settings/api"
        }
    }
    
    configured_count = len(available)
    total_providers = 4
    
    return {
        "status": "ready" if configured_count > 0 else "no_providers",
        "configured_providers": available,
        "providers": providers_status,
        "message": f"{configured_count}/{total_providers} AI providers configured",
        "recommendation": "Add API keys to backend/.env file" if configured_count < total_providers else "All providers configured!"
    }


# =============================================================================
# COMPETITOR DISCOVERY - Auto-discover local & global competitors
# =============================================================================

class DiscoverCompetitorsRequest(BaseModel):
    """Request to discover competitors for a brand"""
    brand: str
    category: str
    location: Optional[str] = None  # e.g., "France", "New York", "Europe"


@router.post("/discover-competitors", response_model=CompetitorDiscoveryResult)
async def discover_competitors(request: DiscoverCompetitorsRequest):
    """
    🔍 DISCOVER COMPETITORS - AI-powered competitor discovery
    
    Uses AI to find the top 10 competitors (5 local + 5 global).
    
    Priority order:
    1. 🧠 Claude Sonnet 4 (best for analysis)
    2. 💎 Gemini 1.5 Pro (fallback)
    3. 🤖 Any available provider
    
    Example:
    ```json
    {
        "brand": "American Vintage",
        "category": "fashion clothing",
        "location": "France"
    }
    ```
    
    Returns:
    - local_competitors: 5 regional competitors with names, websites, and reasons
    - global_competitors: 5 international competitors with names, websites, and reasons
    - total_found: Total number of competitors discovered
    """
    try:
        logger.info(f"Discovering competitors for {request.brand} in {request.category}")
        
        result = await competitor_analyzer.discover_top_competitors(
            brand=request.brand,
            category=request.category,
            location=request.location
        )
        
        logger.info(f"Found {result.total_found} competitors for {request.brand}")
        return result
        
    except Exception as e:
        logger.error(f"Error discovering competitors: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to discover competitors: {str(e)}"
        )


# =============================================================================
# WEBSITE ANALYSIS - Extract brand context for smart prompts
# =============================================================================

@router.post("/analyze-site", response_model=AnalyzeSiteResponse)
async def analyze_website(request: AnalyzeSiteRequest):
    """
    🔍 ANALYZE WEBSITE - Extract brand context for smart testing
    
    Fetches website content and uses AI to understand:
    - What the brand sells (specific category)
    - Their unique selling points
    - Known competitors
    - Target audience
    
    Returns suggested questions to test based on the analysis.
    
    Example:
    ```json
    {
        "brand_name": "Dinh Van",
        "website_url": "https://dinhvan.com",
        "additional_context": "luxury French jewelry brand"
    }
    ```
    
    Response includes:
    - detected_category: "luxury French jewelry"
    - suggested_questions: ["What are the best luxury jewelry brands?", ...]
    - detected_competitors: ["Cartier", "Van Cleef", ...]
    """
    try:
        logger.info(f"Analyzing website for {request.brand_name}: {request.website_url}")
        
        result = await website_analyzer.analyze_website(
            brand_name=request.brand_name,
            website_url=request.website_url,
            additional_context=request.additional_context
        )
        
        if result.success:
            logger.info(f"Analysis complete: category={result.detected_category}, {len(result.suggested_questions)} questions")
        else:
            logger.warning(f"Analysis failed: {result.error}")
        
        return result
        
    except Exception as e:
        logger.error(f"Website analysis error: {e}")
        return AnalyzeSiteResponse(
            success=False,
            error=str(e)
        )


# =============================================================================
# SMART BRAND ANALYSIS - Peec AI-style intelligent analysis
# =============================================================================

@router.post("/analyze-brand", response_model=BrandAnalysisResponse)
@limiter.limit("10/hour")
async def analyze_brand_smart(request: Request, analysis_request: BrandAnalysisRequest):
    """
    🧠 SMART BRAND ANALYSIS - Peec AI-style intelligent website analysis
    
    Analyzes website and generates:
    - Industry/category detection
    - Products/services extraction
    - Competitor auto-detection
    - Smart prompt generation with categories
    - Topic clustering for organized display
    
    This powers the multi-step visibility wizard.
    
    Example:
    ```json
    {
        "brand_name": "Love Lab",
        "website_url": "https://love-lab.com",
        "industry_hint": "jewelry",
        "known_competitors": ["Kimai", "Vrai"]
    }
    ```
    
    Returns:
    - profile: Complete brand profile (industry, products, USP, audience)
    - suggested_prompts: 10 AI-generated prompts with categories
    - topic_clusters: Prompts organized by topic (Recommendations, Comparisons, etc.)
    - detected_competitors: Auto-detected + user-provided competitors
    """
    try:
        logger.info(f"Smart brand analysis for {analysis_request.brand_name}: {analysis_request.website_url}")

        profile = await brand_analyzer.analyze_brand(
            website_url=analysis_request.website_url,
            brand_name=analysis_request.brand_name,
            industry_hint=analysis_request.industry_hint,
            known_competitors=analysis_request.known_competitors
        )
        
        logger.info(f"Analysis complete: {profile.industry}, {len(profile.suggested_prompts)} prompts")
        
        return BrandAnalysisResponse(
            success=True,
            profile=profile,
            suggested_prompts=profile.suggested_prompts,
            topic_clusters=profile.topic_clusters,
            detected_competitors=profile.competitors
        )
        
    except Exception as e:
        logger.error(f"Smart brand analysis error: {e}")
        return BrandAnalysisResponse(
            success=False,
            error=str(e)
        )


# =============================================================================
# AI VISIBILITY SCORE - THE KILLER FEATURE
# =============================================================================

@router.post("/score", response_model=ScoreResponse)
@limiter.limit("5/hour")
async def get_visibility_score(request: Request, score_request: ScoreRequest):
    """
    🚀 AI VISIBILITY SCORE - Instant brand visibility test
    
    The killer feature. Tests your brand across multiple AI models
    in parallel and returns a comprehensive visibility score.
    
    Input:
    - brand: Your brand name (e.g., "Nike")
    - category: Product/service category (e.g., "running shoes")
    - location: Optional location for local businesses
    
    Output:
    - score: 0-100 visibility score
    - verdict: "invisible", "ghost", "contender", "visible", "authority"
    - competitors: Who AI recommends instead of you
    - killer_quote: The "aha" moment showing your invisibility
    - share_text: Pre-written viral text for LinkedIn
    
    Runs 12 AI queries in parallel (4 prompts × 3 models)
    Target response time: under 15 seconds
    
    Example:
    ```json
    {
        "brand": "Nike",
        "category": "running shoes"
    }
    ```
    """
    try:
        logger.info(f"Running AI Visibility Score test for {request.brand} in {request.category}")
        
        result = await speed_test_service.run_test(
            brand=score_request.brand,
            category=score_request.category,
            location=score_request.location
        )
        
        logger.info(f"Test completed: score={result.score}, verdict={result.verdict}")
        return result
        
    except Exception as e:
        logger.error(f"Speed test error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to run visibility test: {str(e)}"
        )


@router.post("/test-multi-model")
@limiter.limit("20/hour")
async def test_across_models(request: Request, test_request: MultiModelRequest):
    """
    Test a single prompt across ALL AI models.
    
    Returns results from each model showing:
    - If your brand was mentioned
    - Position in the response
    - Sentiment
    - Competitors mentioned
    - Preview of the response
    
    Example:
    ```json
    {
        "prompt": "What are the best jewelry brands?",
        "brand": "Love Lab",
        "competitors": ["Cartier", "Tiffany", "Bulgari"]
    }
    ```
    """
    try:
        result = await visibility_monitor.test_across_models(
            prompt=test_request.prompt,
            brand=test_request.brand,
            competitors=test_request.competitors,
            models_to_test=test_request.models
        )
        
        # Add model icons for frontend
        model_icons = {m["id"]: m["icon"] for m in AI_MODELS}
        
        return {
            "prompt": result.prompt,
            "brand": result.brand,
            "models_tested": result.models_tested,
            "models_mentioning": result.models_mentioning,
            "mention_rate": result.mention_rate,
            "results": [
                {
                    **r.dict(),
                    "icon": model_icons.get(r.model_id, "🤖")
                }
                for r in result.results
            ],
            "summary": result.summary,
            "chart_data": {
                "labels": [r.model_name for r in result.results],
                "mentioned": [1 if r.brand_mentioned else 0 for r in result.results],
                "providers": [r.provider for r in result.results]
            }
        }
    except Exception as e:
        logger.error(f"Error testing across models: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/comprehensive-test")
async def run_comprehensive_test(request: ComprehensiveTestRequest):
    """
    Run comprehensive visibility test:
    - Auto-generates 5 relevant questions based on your brand
    - Tests each question across all 6 AI models
    - Returns a matrix showing visibility across prompts × models
    
    Example:
    ```json
    {
        "brand": "Love Lab",
        "competitors": ["Cartier", "Tiffany"],
        "industry": "jewelry",
        "num_prompts": 5
    }
    ```
    
    Returns:
    - Overall visibility score
    - Results matrix (5 prompts × 6 models = 30 tests)
    - Best/worst performing prompts
    - Model-by-model performance
    """
    try:
        result = await visibility_monitor.run_comprehensive_test(
            brand=request.brand,
            competitors=request.competitors,
            industry=request.industry,
            num_prompts=request.num_prompts
        )
        
        # Add icons for frontend
        model_icons = {m["id"]: m["icon"] for m in AI_MODELS}
        
        # Enhance model performance with icons
        for mp in result.get("model_performance", []):
            mp["icon"] = model_icons.get(mp["model_id"], "🤖")
        
        return result
        
    except Exception as e:
        logger.error(f"Error in comprehensive test: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-prompts")
async def generate_prompts(brand: str, competitors: List[str] = [], industry: str = "default"):
    """
    Generate smart prompts based on brand and industry.
    Uses AI to create relevant questions customers might ask.
    """
    try:
        prompts = await visibility_monitor.generate_smart_prompts(
            brand=brand,
            competitors=competitors,
            industry=industry,
            count=5
        )
        return {"brand": brand, "prompts": prompts}
    except Exception as e:
        logger.error(f"Error generating prompts: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/test-prompt", response_model=PromptResult)
async def test_single_prompt(request: SinglePromptRequest):
    """
    Test a single prompt to see if your brand appears.
    
    Example:
    ```json
    {
        "prompt": "What are the best jewelry brands?",
        "brand": "Love Lab",
        "competitors": ["Cartier", "Tiffany"],
        "model": "auto"
    }
    ```
    """
    try:
        result = await visibility_monitor.test_prompt(
            prompt=request.prompt,
            brand=request.brand,
            competitors=request.competitors,
            model=request.model
        )
        return result
    except Exception as e:
        logger.error(f"Error testing prompt: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/check", response_model=VisibilityReport)
async def run_visibility_check(request: VisibilityCheckRequest):
    """
    Run a full visibility check across multiple prompts.
    
    If no prompts provided, uses industry-specific defaults.
    
    Example:
    ```json
    {
        "brand": "Love Lab",
        "competitors": ["Cartier", "Tiffany", "Redline"],
        "industry": "jewelry",
        "models": ["auto"]
    }
    ```
    
    Returns comprehensive report with:
    - Mention rate (% of prompts where brand appears)
    - Average position (1st, 2nd, 3rd)
    - Sentiment analysis
    - Competitor comparison
    - Actionable recommendations
    """
    try:
        # Use provided prompts or get defaults
        prompts = request.prompts
        if not prompts:
            prompts = visibility_monitor.get_default_prompts(
                industry=request.industry,
                brand=request.brand
            )
        
        report = await visibility_monitor.run_visibility_check(
            brand=request.brand,
            prompts=prompts,
            competitors=request.competitors,
            models=request.models
        )
        return report
    except Exception as e:
        logger.error(f"Error running visibility check: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/quick-check")
async def quick_visibility_check(request: QuickCheckRequest):
    """
    Quick visibility check with smart defaults.
    
    Just provide brand name and we'll:
    1. Generate relevant prompts for your industry
    2. Test across AI models
    3. Compare against competitors
    4. Return actionable insights
    
    Example:
    ```json
    {
        "brand": "Love Lab",
        "website_url": "https://love-lab.com",
        "competitors": ["Redline", "Dinh Van", "Kimai"],
        "industry": "jewelry"
    }
    ```
    """
    try:
        # Get industry-specific prompts
        prompts = visibility_monitor.get_default_prompts(
            industry=request.industry,
            brand=request.brand
        )
        
        # Run visibility check
        report = await visibility_monitor.run_visibility_check(
            brand=request.brand,
            prompts=prompts[:5],  # Limit to 5 for quick check
            competitors=request.competitors,
            models=["auto"]
        )
        
        # Format as easy-to-read response
        return {
            "brand": request.brand,
            "visibility_score": f"{report.mention_rate:.0f}%",
            "average_position": report.avg_position if report.avg_position > 0 else "Not ranked",
            "prompts_tested": report.total_prompts,
            "times_mentioned": report.mentions,
            "sentiment": max(report.sentiment_breakdown, key=report.sentiment_breakdown.get),
            "top_competitor": report.top_competitors[0]["name"] if report.top_competitors else None,
            "recommendations": report.recommendations,
            "full_report": report.dict()
        }
    except Exception as e:
        logger.error(f"Error in quick check: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/prompts/{industry}")
async def get_suggested_prompts(industry: str, brand: str = "your brand"):
    """
    Get suggested prompts for an industry.
    
    Industries: jewelry, saas, ecommerce, default
    """
    prompts = visibility_monitor.get_default_prompts(industry, brand)
    return {
        "industry": industry,
        "brand": brand,
        "prompts": prompts,
        "count": len(prompts)
    }


# =============================================================================
# EMAIL REPORT - Send visibility results via email
# =============================================================================

class EmailReportRequest(BaseModel):
    """Request to send visibility report via email"""
    email: str
    brand_name: str
    overall_score: int
    grade: str
    category_results: List[dict]
    strengths: List[dict]
    weaknesses: List[dict]
    recommendations: List[str]


@router.post("/email-report")
async def send_visibility_report_email(request: EmailReportRequest):
    """
    Send the visibility report to user's email.
    
    Called when user clicks "Email Me This Report" button.
    """
    try:
        import os
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
        
        success = email_service.send_visibility_report(
            to_email=request.email,
            brand_name=request.brand_name,
            overall_score=request.overall_score,
            grade=request.grade,
            category_results=request.category_results,
            strengths=request.strengths,
            weaknesses=request.weaknesses,
            recommendations=request.recommendations,
            frontend_url=frontend_url
        )
        
        if success:
            return {"success": True, "message": "Report sent to your email!"}
        else:
            raise HTTPException(status_code=500, detail="Failed to send email")
            
    except Exception as e:
        logger.error(f"Error sending email report: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# MODEL TIERS - Get models for free vs paid tiers
# =============================================================================

@router.get("/models/free")
async def get_free_tier_models():
    """Get models available in free tier"""
    return {
        "models": [m for m in AI_MODELS if m["id"] in FREE_MODELS],
        "total": len(FREE_MODELS),
        "tier": "free"
    }


@router.get("/models/paid")
async def get_paid_tier_models():
    """Get all models available in paid tier"""
    return {
        "models": AI_MODELS,
        "total": len(AI_MODELS),
        "tier": "paid"
    }

