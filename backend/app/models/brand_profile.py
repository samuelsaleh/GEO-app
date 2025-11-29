"""
Brand Profile Models

Models for website analysis and smart prompt generation.
Used by the Peec AI-style intelligent visibility checker.
"""

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class CompetitorInfo(BaseModel):
    """Information about a detected competitor"""
    name: str
    reason: str = ""  # Why they're a competitor
    website_url: Optional[str] = None
    auto_detected: bool = True  # False if manually added by user


class PromptWithCategory(BaseModel):
    """A prompt with its category for organized display"""
    prompt: str
    category: str  # recommendation, comparison, purchase, reputation, feature
    topic_cluster: Optional[str] = None  # Optional grouping
    selected: bool = True  # Whether user selected this prompt for testing


class TopicCluster(BaseModel):
    """Group of related prompts"""
    name: str  # e.g., "Product Recommendations", "Brand Comparisons"
    category: str
    prompts: List[PromptWithCategory]


class BrandProfile(BaseModel):
    """
    Complete profile of a brand extracted from their website.
    This powers the smart prompt generation.
    """
    brand_name: str
    website_url: str
    
    # Extracted from website
    industry: str  # e.g., "luxury jewelry", "B2B SaaS", "fitness equipment"
    products_services: List[str]  # Main offerings (3-5 items)
    value_proposition: str  # One sentence USP
    target_audience: str  # Who are their customers
    
    # Auto-detected competitors
    competitors: List[CompetitorInfo] = []
    
    # Generated prompts
    suggested_prompts: List[PromptWithCategory] = []
    topic_clusters: List[TopicCluster] = []
    
    # Metadata
    analyzed_at: datetime = datetime.now()
    confidence_score: float = 0.0  # How confident we are in the analysis


class BrandAnalysisRequest(BaseModel):
    """Request to analyze a brand's website"""
    brand_name: str
    website_url: str
    industry_hint: Optional[str] = None  # Optional hint from user
    known_competitors: List[str] = []  # Competitors user already knows


class BrandAnalysisResponse(BaseModel):
    """Response from brand analysis"""
    success: bool
    profile: Optional[BrandProfile] = None
    suggested_prompts: List[PromptWithCategory] = []
    topic_clusters: List[TopicCluster] = []
    detected_competitors: List[CompetitorInfo] = []
    error: Optional[str] = None

