from fastapi import APIRouter, BackgroundTasks
from app.models.health_check import (
    HealthCheckRequest, 
    HealthCheckResult, 
    PageAnalysis,
    CompetitorAnalysis,
    CompetitorComparison
)
from app.services.content_analyzer import ContentAnalyzer
from app.services.competitor_analyzer import competitor_analyzer
from typing import List, Optional
import httpx
from bs4 import BeautifulSoup
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


def get_grade(score: int) -> str:
    """Convert score to letter grade"""
    if score >= 90: return "A+"
    elif score >= 80: return "A"
    elif score >= 70: return "B"
    elif score >= 60: return "C"
    elif score >= 50: return "D"
    else: return "F"


@router.post("/analyze", response_model=HealthCheckResult)
async def analyze_health(request: HealthCheckRequest, background_tasks: BackgroundTasks):
    """
    Analyze pages for AI visibility with optional competitor comparison
    
    Features:
    - Analyzes user's pages for AI visibility score
    - Optionally analyzes competitors (user-provided or AI-discovered)
    - Generates comparison insights and opportunities
    """
    analyzer = ContentAnalyzer()
    pages_analyzed = []
    all_issues = []
    all_strengths = []
    has_schema_overall = False
    has_faq_overall = False

    # Analyze user's pages
    logger.info(f"Analyzing {len(request.page_urls)} pages for {request.company_name}")
    
    for url in request.page_urls[:10]:  # Limit to 10 pages
        try:
            analysis = await analyzer.analyze_page(str(url))
            pages_analyzed.append(analysis)
            all_issues.extend(analysis.issues)
            all_strengths.extend(analysis.strengths)
            if analysis.has_schema:
                has_schema_overall = True
            if analysis.has_faq:
                has_faq_overall = True
        except Exception as e:
            logger.error(f"Failed to analyze {url}: {e}")
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

    # Get top issues and strengths
    top_issues = list(set(all_issues))[:5]
    top_strengths = list(set(all_strengths))[:3]

    # Generate recommendations
    recommendations = analyzer.generate_recommendations(pages_analyzed)

    # AI visibility check (simplified)
    ai_visibility = {
        "chatgpt": False,
        "bing_chat": False,
        "google_gemini": False,
        "perplexity": False
    }

    # ============================================
    # COMPETITOR ANALYSIS
    # ============================================
    competitor_comparison: Optional[CompetitorComparison] = None
    
    competitors_to_analyze = []
    
    # Option 1: Use user-provided competitors
    if request.competitors:
        logger.info(f"Using {len(request.competitors)} user-provided competitors")
        for comp in request.competitors[:3]:  # Max 3
            competitors_to_analyze.append({
                "name": comp.name,
                "url": str(comp.url),
                "ai_discovered": False,
                "reason": "User provided"
            })
    
    # Option 2: Auto-discover competitors using AI
    elif request.auto_discover_competitors:
        logger.info("Auto-discovering competitors using AI...")
        main_url = str(request.page_urls[0]) if request.page_urls else ""
        discovered = await competitor_analyzer.discover_competitors(
            company_name=request.company_name,
            website_url=main_url,
            industry_keywords=request.industry_keywords
        )
        competitors_to_analyze = discovered
        logger.info(f"Discovered {len(discovered)} competitors")
    
    # Analyze competitors if we have any
    if competitors_to_analyze:
        competitor_analyses = []
        
        for comp in competitors_to_analyze:
            try:
                logger.info(f"Analyzing competitor: {comp['name']} ({comp['url']})")
                comp_analysis = await analyzer.analyze_page(comp["url"])
                
                diff = overall_score - comp_analysis.score
                status = "ahead" if diff > 0 else "behind" if diff < 0 else "tied"
                
                competitor_analyses.append(CompetitorAnalysis(
                    name=comp["name"],
                    url=comp["url"],
                    score=comp_analysis.score,
                    grade=get_grade(comp_analysis.score),
                    difference=diff,
                    status=status,
                    has_schema=comp_analysis.has_schema,
                    has_faq=comp_analysis.has_faq,
                    top_strengths=comp_analysis.strengths[:3],
                    ai_discovered=comp.get("ai_discovered", False),
                    discovery_reason=comp.get("reason")
                ))
            except Exception as e:
                logger.error(f"Failed to analyze competitor {comp['name']}: {e}")
                # Still include with score 0
                competitor_analyses.append(CompetitorAnalysis(
                    name=comp["name"],
                    url=comp["url"],
                    score=0,
                    grade="F",
                    difference=overall_score,
                    status="ahead",
                    has_schema=False,
                    has_faq=False,
                    top_strengths=[],
                    ai_discovered=comp.get("ai_discovered", False),
                    discovery_reason=f"Analysis failed: {str(e)}"
                ))
        
        # Generate comparison report
        if competitor_analyses:
            user_analysis = {
                "overall_score": overall_score,
                "has_schema": has_schema_overall,
                "has_faq": has_faq_overall
            }
            
            # Calculate ranking
            all_scores = [overall_score] + [c.score for c in competitor_analyses]
            sorted_scores = sorted(all_scores, reverse=True)
            ranking = sorted_scores.index(overall_score) + 1
            
            # Generate insights
            insights = []
            opportunities = []
            
            avg_comp_score = sum(c.score for c in competitor_analyses) / len(competitor_analyses)
            
            if overall_score > avg_comp_score:
                insights.append(
                    f"🎉 You score {overall_score - avg_comp_score:.0f} points above your competitors' average!"
                )
            else:
                insights.append(
                    f"⚠️ You're {avg_comp_score - overall_score:.0f} points below competitors' average"
                )
            
            if ranking == 1:
                insights.append("🏆 You're #1 among analyzed competitors!")
            elif ranking == len(all_scores):
                insights.append("📈 Room for improvement - currently ranked last")
            else:
                insights.append(f"📊 You rank #{ranking} of {len(all_scores)} sites analyzed")
            
            # Find opportunities from competitors
            for comp in competitor_analyses:
                if comp.has_schema and not has_schema_overall:
                    opportunities.append(
                        f"Add schema markup - {comp.name} uses it"
                    )
                    break
            
            for comp in competitor_analyses:
                if comp.has_faq and not has_faq_overall:
                    opportunities.append(
                        f"Add FAQ sections - {comp.name} has them"
                    )
                    break
            
            # Find what top competitor does well
            top_competitor = max(competitor_analyses, key=lambda x: x.score)
            if top_competitor.score > overall_score:
                if top_competitor.top_strengths:
                    opportunities.append(
                        f"Learn from {top_competitor.name}: {top_competitor.top_strengths[0]}"
                    )
            
            competitor_comparison = CompetitorComparison(
                user_score=overall_score,
                user_grade=get_grade(overall_score),
                avg_competitor_score=avg_comp_score,
                competitors=competitor_analyses,
                ranking=ranking,
                total_analyzed=len(all_scores),
                insights=insights,
                opportunities=opportunities[:5]  # Max 5 opportunities
            )
            
            # Add competitor insights to recommendations
            if opportunities:
                recommendations.insert(0, f"🎯 Competitor insight: {opportunities[0]}")

    return HealthCheckResult(
        overall_score=overall_score,
        grade=get_grade(overall_score),
        total_pages=len(request.page_urls),
        pages_analyzed=pages_analyzed,
        top_issues=top_issues,
        top_strengths=top_strengths,
        recommendations=recommendations,
        ai_visibility=ai_visibility,
        competitor_comparison=competitor_comparison
    )


@router.post("/discover-competitors")
async def discover_competitors(
    company_name: str,
    website_url: str,
    industry_keywords: Optional[List[str]] = None
):
    """
    Discover competitors using AI
    
    This endpoint can be called separately to get competitor suggestions
    before running the full analysis.
    """
    discovered = await competitor_analyzer.discover_competitors(
        company_name=company_name,
        website_url=website_url,
        industry_keywords=industry_keywords
    )
    
    return {
        "success": True,
        "competitors": discovered,
        "count": len(discovered),
        "message": f"Found {len(discovered)} potential competitors" if discovered else "No competitors found. Try providing industry keywords."
    }


@router.get("/test")
async def test_endpoint():
    """Test endpoint to verify API is working"""
    return {
        "status": "healthy",
        "message": "Health check API is working",
        "features": ["page_analysis", "competitor_analysis", "ai_discovery"]
    }
