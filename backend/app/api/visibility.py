"""
AI Visibility Monitoring API

Endpoints for tracking brand visibility across AI models.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import logging

from app.services.visibility_monitor import visibility_monitor, VisibilityReport, PromptResult, MultiModelResult, AI_MODELS

router = APIRouter()
logger = logging.getLogger(__name__)


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


@router.get("/models")
async def get_available_models():
    """Get list of available AI models for testing"""
    return {
        "models": AI_MODELS,
        "total": len(AI_MODELS),
        "providers": ["openai", "anthropic", "google"]
    }


@router.post("/test-multi-model")
async def test_across_models(request: MultiModelRequest):
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
            prompt=request.prompt,
            brand=request.brand,
            competitors=request.competitors,
            models_to_test=request.models
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

