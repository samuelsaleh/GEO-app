from fastapi import APIRouter, BackgroundTasks
from app.models.health_check import HealthCheckRequest, HealthCheckResult, PageAnalysis
from app.services.content_analyzer import ContentAnalyzer
from typing import List
import httpx
from bs4 import BeautifulSoup

router = APIRouter()

@router.post("/analyze", response_model=HealthCheckResult)
async def analyze_health(request: HealthCheckRequest, background_tasks: BackgroundTasks):
    """
    Analyze pages for AI visibility
    This is a simplified version - full version would use AI APIs
    """

    analyzer = ContentAnalyzer()
    pages_analyzed = []
    all_issues = []
    all_strengths = []

    for url in request.page_urls[:10]:  # Limit to 10 pages for demo
        try:
            analysis = await analyzer.analyze_page(str(url))
            pages_analyzed.append(analysis)
            all_issues.extend(analysis.issues)
            all_strengths.extend(analysis.strengths)
        except Exception as e:
            # Handle individual page errors
            pages_analyzed.append(PageAnalysis(
                url=str(url),
                score=0,
                has_schema=False,
                has_faq=False,
                readability_score=0,
                page_speed=0,
                issues=[f"Failed to analyze: {str(e)}"],
                strengths=[]
            ))

    # Calculate overall score
    if pages_analyzed:
        overall_score = sum(p.score for p in pages_analyzed) // len(pages_analyzed)
    else:
        overall_score = 0

    # Get top issues (most common)
    top_issues = list(set(all_issues))[:5]
    top_strengths = list(set(all_strengths))[:3]

    # Generate recommendations
    recommendations = analyzer.generate_recommendations(pages_analyzed)

    # AI visibility check (simplified for demo)
    ai_visibility = {
        "chatgpt": False,
        "bing_chat": False,
        "google_gemini": False,
        "perplexity": False
    }

    # Background task: Send email with results
    # background_tasks.add_task(send_report_email, request.contact_email, result)

    return HealthCheckResult(
        overall_score=overall_score,
        total_pages=len(request.page_urls),
        pages_analyzed=pages_analyzed,
        top_issues=top_issues,
        top_strengths=top_strengths,
        recommendations=recommendations,
        ai_visibility=ai_visibility
    )

@router.get("/test")
async def test_endpoint():
    """Test endpoint to verify API is working"""
    return {
        "status": "healthy",
        "message": "Health check API is working"
    }
