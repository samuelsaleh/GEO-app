from pydantic import BaseModel, HttpUrl, EmailStr
from typing import List, Optional

class HealthCheckRequest(BaseModel):
    company_name: str
    contact_email: EmailStr
    page_urls: List[HttpUrl]
    questions: List[str]

class PageAnalysis(BaseModel):
    url: str
    score: int
    has_schema: bool
    has_faq: bool
    readability_score: float
    page_speed: float
    issues: List[str]
    strengths: List[str]

class HealthCheckResult(BaseModel):
    overall_score: int
    total_pages: int
    pages_analyzed: List[PageAnalysis]
    top_issues: List[str]
    top_strengths: List[str]
    recommendations: List[str]
    ai_visibility: dict  # Which AI engines mention the site
