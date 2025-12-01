"""
Analytics API - Detailed insights into test performance
"""

from fastapi import APIRouter, HTTPException
from sqlalchemy import func, desc
from typing import List, Dict
import logging

from app.database import SessionLocal
from app.models.analytics import PromptTestResult, ModelTestResult, PromptLibrary
from app.models.database import VisibilityTest

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/prompt-performance")
async def get_prompt_performance():
    """
    📊 PROMPT PERFORMANCE - See which questions work best

    Returns:
    - Best performing prompts (highest success rate)
    - Worst performing prompts (need improvement)
    - Average success rate per category
    - Recommendations for better prompts
    """
    try:
        db = SessionLocal()

        # Get prompt performance from library
        prompts = db.query(PromptLibrary).order_by(
            desc(PromptLibrary.effectiveness_score)
        ).limit(50).all()

        best_prompts = [
            {
                "prompt": p.prompt_text,
                "category": p.category,
                "success_rate": f"{p.success_rate * 100:.1f}%",
                "times_used": p.times_used,
                "avg_position": p.avg_mention_position,
                "effectiveness": p.effectiveness_score
            }
            for p in prompts[:10]
        ]

        worst_prompts = [
            {
                "prompt": p.prompt_text,
                "category": p.category,
                "success_rate": f"{p.success_rate * 100:.1f}%",
                "times_used": p.times_used,
                "problem": "Low success rate - consider rephrasing"
            }
            for p in prompts[-10:] if p.times_used > 5
        ]

        # Category breakdown
        category_stats = db.query(
            PromptLibrary.category,
            func.avg(PromptLibrary.success_rate).label('avg_success'),
            func.count(PromptLibrary.id).label('count')
        ).group_by(PromptLibrary.category).all()

        categories = [
            {
                "category": cat.category,
                "success_rate": f"{cat.avg_success * 100:.1f}%",
                "prompt_count": cat.count
            }
            for cat in category_stats
        ]

        db.close()

        return {
            "best_prompts": best_prompts,
            "worst_prompts": worst_prompts,
            "category_performance": categories,
            "insights": {
                "total_prompts_tested": len(prompts),
                "best_category": max(categories, key=lambda x: float(x["success_rate"][:-1]))["category"] if categories else None,
                "recommendation": "Focus on improving low-performing categories"
            }
        }

    except Exception as e:
        logger.error(f"Error fetching prompt performance: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/model-comparison")
async def get_model_comparison():
    """
    🤖 MODEL COMPARISON - Which AI models are most reliable

    Returns:
    - Accuracy per model
    - Bias detection (does a model favor certain brands?)
    - Response time comparison
    - Cost per test
    """
    try:
        db = SessionLocal()

        # Get model performance
        model_stats = db.query(
            ModelTestResult.model_id,
            ModelTestResult.model_name,
            ModelTestResult.provider,
            func.count(ModelTestResult.id).label('tests'),
            func.avg(func.cast(ModelTestResult.brand_mentioned, float)).label('mention_rate'),
            func.avg(ModelTestResult.response_time_ms).label('avg_response_time'),
            func.sum(ModelTestResult.tokens_used).label('total_tokens')
        ).group_by(
            ModelTestResult.model_id,
            ModelTestResult.model_name,
            ModelTestResult.provider
        ).all()

        models = [
            {
                "model": stat.model_name,
                "provider": stat.provider,
                "tests_run": stat.tests,
                "mention_rate": f"{stat.mention_rate * 100:.1f}%",
                "avg_response_time": f"{stat.avg_response_time:.0f}ms",
                "reliability": "High" if stat.mention_rate > 0.7 else "Medium" if stat.mention_rate > 0.4 else "Low",
                "total_tokens": stat.total_tokens or 0
            }
            for stat in model_stats
        ]

        # Sort by mention rate
        models_sorted = sorted(models, key=lambda x: float(x["mention_rate"][:-1]), reverse=True)

        db.close()

        return {
            "models": models_sorted,
            "insights": {
                "most_reliable": models_sorted[0]["model"] if models_sorted else None,
                "fastest": min(models, key=lambda x: float(x["avg_response_time"][:-2]))["model"] if models else None,
                "recommendation": "Use top 3 models for accurate results"
            }
        }

    except Exception as e:
        logger.error(f"Error fetching model comparison: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/quality-insights")
async def get_quality_insights():
    """
    💡 QUALITY INSIGHTS - Understand why tests succeed or fail

    Returns:
    - Common failure patterns
    - Success indicators
    - Brand visibility correlations
    - Actionable improvements
    """
    try:
        db = SessionLocal()

        # Get all test results with details
        total_tests = db.query(func.count(VisibilityTest.id)).scalar() or 0

        # Success patterns (high score tests)
        high_performers = db.query(VisibilityTest).filter(
            VisibilityTest.overall_score >= 80
        ).limit(100).all()

        # Low performers
        low_performers = db.query(VisibilityTest).filter(
            VisibilityTest.overall_score < 50
        ).limit(100).all()

        # Analyze patterns
        high_score_industries = {}
        low_score_industries = {}

        for test in high_performers:
            industry = test.industry or "unknown"
            high_score_industries[industry] = high_score_industries.get(industry, 0) + 1

        for test in low_performers:
            industry = test.industry or "unknown"
            low_score_industries[industry] = low_score_industries.get(industry, 0) + 1

        db.close()

        insights = []

        # Generate insights
        if total_tests > 0:
            high_score_rate = (len(high_performers) / total_tests) * 100
            low_score_rate = (len(low_performers) / total_tests) * 100

            if high_score_rate < 30:
                insights.append({
                    "type": "warning",
                    "message": f"Only {high_score_rate:.1f}% of tests score high (80+)",
                    "recommendation": "Review prompt quality and model selection"
                })

            if low_score_rate > 30:
                insights.append({
                    "type": "critical",
                    "message": f"{low_score_rate:.1f}% of tests score below 50",
                    "recommendation": "Improve question clarity and test more models"
                })

        return {
            "total_tests": total_tests,
            "high_performers": len(high_performers),
            "low_performers": len(low_performers),
            "high_score_industries": high_score_industries,
            "low_score_industries": low_score_industries,
            "insights": insights,
            "recommendations": [
                "Test with at least 3 different AI models for accuracy",
                "Use specific, contextual prompts instead of generic questions",
                "Focus on industries with proven high performance"
            ]
        }

    except Exception as e:
        logger.error(f"Error fetching quality insights: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/category-breakdown")
async def get_category_breakdown():
    """
    📈 CATEGORY BREAKDOWN - Performance by question type

    Returns which categories (recommendation, comparison, etc.) work best
    """
    try:
        db = SessionLocal()

        # Get prompt test results by category
        category_stats = db.query(
            PromptTestResult.prompt_category,
            func.count(PromptTestResult.id).label('tests'),
            func.avg(func.cast(PromptTestResult.brand_mentioned, float)).label('success_rate'),
            func.avg(PromptTestResult.mention_position).label('avg_position')
        ).group_by(
            PromptTestResult.prompt_category
        ).all()

        categories = [
            {
                "category": stat.prompt_category or "uncategorized",
                "tests_run": stat.tests,
                "success_rate": f"{stat.success_rate * 100:.1f}%",
                "avg_position": f"{stat.avg_position:.1f}" if stat.avg_position else "N/A",
                "quality": "Excellent" if stat.success_rate > 0.7 else "Good" if stat.success_rate > 0.5 else "Needs Improvement"
            }
            for stat in category_stats
        ]

        db.close()

        return {
            "categories": categories,
            "insights": {
                "best_category": max(categories, key=lambda x: float(x["success_rate"][:-1]))["category"] if categories else None,
                "worst_category": min(categories, key=lambda x: float(x["success_rate"][:-1]))["category"] if categories else None
            }
        }

    except Exception as e:
        logger.error(f"Error fetching category breakdown: {e}")
        raise HTTPException(status_code=500, detail=str(e))
