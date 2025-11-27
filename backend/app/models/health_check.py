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
    # New: competitor analysis
    competitors: Optional[List[CompetitorInput]] = None  # User-provided competitors
    auto_discover_competitors: bool = False  # Let AI find competitors
    industry_keywords: Optional[List[str]] = None  # Help AI find better competitors


class PageAnalysis(BaseModel):
    """Analysis of a single page"""
    url: str
    score: int
    has_schema: bool
    has_faq: bool
    readability_score: float
    page_speed: float
    issues: List[str]
    strengths: List[str]


class CompetitorAnalysis(BaseModel):
    """Analysis of a competitor"""
    name: str
    url: str
    score: int
    difference: int  # vs user score (positive = user is better)
    status: str  # "ahead", "behind", "tied"
    has_schema: bool
    has_faq: bool
    top_strengths: List[str]
    ai_discovered: bool = False
    discovery_reason: Optional[str] = None


class CompetitorComparison(BaseModel):
    """Comparison between user and competitors"""
    user_score: int
    competitors: List[CompetitorAnalysis]
    ranking: int  # User's rank (1 = best)
    total_analyzed: int
    insights: List[str]
    opportunities: List[str]


class HealthCheckResult(BaseModel):
    """Complete health check result"""
    overall_score: int
    total_pages: int
    pages_analyzed: List[PageAnalysis]
    top_issues: List[str]
    top_strengths: List[str]
    recommendations: List[str]
    ai_visibility: Dict[str, bool]  # Which AI engines mention the site
    # New: competitor comparison
    competitor_comparison: Optional[CompetitorComparison] = None
