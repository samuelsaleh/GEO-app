"""
Speed Test Models

Pydantic models for the AI Visibility Score feature.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime


class PromptCategory(str, Enum):
    """Categories of prompts to test different search intents"""
    RECOMMENDATION = "recommendation"  # "Best X brands"
    COMPARISON = "comparison"          # "X vs Y"
    REPUTATION = "reputation"          # "Is X good?"
    PURCHASE = "purchase"              # "Where to buy X"


class ScoreRequest(BaseModel):
    """Request to run an AI visibility score test"""
    brand: str = Field(..., description="Brand name to test", min_length=1, max_length=100)
    category: str = Field(..., description="Product/service category", min_length=1, max_length=100)
    location: Optional[str] = Field(None, description="Optional location for local businesses")
    website_url: Optional[str] = Field(None, description="Optional website URL for future technical checks")


class ModelResult(BaseModel):
    """Result from a single AI model query"""
    model_id: str                           # "gpt-4o-mini"
    model_name: str                         # "ChatGPT"
    provider: str                           # "openai"
    mentioned: bool                         # True/False
    position: Optional[int] = None          # 1, 2, 3... or None
    sentiment: str = "neutral"              # "positive", "neutral", "negative"
    competitors_found: List[str] = []       # ["Adidas", "New Balance"]
    killer_quote: Optional[str] = None      # "I recommend Adidas for..."
    full_response: str = ""
    response_time_ms: int = 0
    prompt: str = ""                        # The prompt that was tested
    error: Optional[str] = None             # Error message if query failed


class PromptResult(BaseModel):
    """Aggregated results for a single prompt across all models"""
    prompt: str
    category: PromptCategory
    models: List[ModelResult]
    mention_rate: float                     # 0.67 = 2/3 models mentioned
    best_position: Optional[int] = None     # Best position across models


class CompetitorInfo(BaseModel):
    """Information about a competitor found in AI responses"""
    name: str
    mentions: int                           # How many times mentioned across all tests
    rate: int                               # Percentage of tests where mentioned (0-100)


class ModelBreakdown(BaseModel):
    """Breakdown of results by AI model"""
    model_id: str
    model_name: str
    provider: str
    mentions: int                           # Times brand was mentioned
    total: int                              # Total tests for this model
    rate: int                               # Mention rate percentage


class ScoreResponse(BaseModel):
    """Complete response from AI Visibility Score test"""
    
    # Core score
    score: int = Field(..., ge=0, le=100, description="AI Visibility Score 0-100")
    verdict: str                            # "invisible", "ghost", "contender", "visible", "authority"
    verdict_emoji: str                      # "🔴", "🟠", "🟡", "🟢", "💚"
    grade: str                              # "F", "D", "C", "B", "A"
    
    # Brand info
    brand: str
    category: str
    location: Optional[str] = None
    
    # Test summary
    total_tests: int                        # 12 (4 prompts x 3 models)
    total_mentions: int                     # How many tests mentioned the brand
    mention_rate: float                     # 0.25 = 25%
    
    # Detailed results
    prompt_results: List[PromptResult] = []
    model_breakdown: List[ModelBreakdown] = []
    
    # Competitor analysis
    competitors: List[CompetitorInfo] = []
    you_vs_top: Optional[Dict[str, Any]] = None  # {"competitor": "Adidas", "their_rate": 83, "gap": 60}
    
    # The "aha" moment
    worst_prompt: Optional[Dict[str, Any]] = None  # The prompt where you performed worst
    killer_quote: Optional[str] = None      # "When asked about running shoes, ChatGPT said..."
    
    # Example AI response (for display)
    example_response: Optional[Dict[str, Any]] = None  # {"prompt": "...", "response": "...", "model": "ChatGPT"}
    
    # Sharing
    share_text: str = ""
    share_url: Optional[str] = None
    
    # Metadata
    tested_at: datetime = Field(default_factory=datetime.now)
    test_duration_ms: int = 0


# Category configurations for smart prompts
CATEGORY_CONFIG = {
    "running shoes": {
        "prompts": [
            "What are the best running shoes?",
            "Top running shoe brands in 2025",
            "Best running shoes for beginners"
        ],
        "known_brands": ["Nike", "Adidas", "New Balance", "Brooks", "ASICS", "Hoka", "Saucony"],
    },
    "crm software": {
        "prompts": [
            "What is the best CRM software?",
            "Top CRM tools for small business",
            "Best CRM for sales teams"
        ],
        "known_brands": ["Salesforce", "HubSpot", "Pipedrive", "Zoho", "Monday", "Freshsales"],
    },
    "jewelry": {
        "prompts": [
            "What are the best jewelry brands?",
            "Top luxury jewelry brands",
            "Best jewelry for engagement rings"
        ],
        "known_brands": ["Cartier", "Tiffany", "Bulgari", "Van Cleef", "Harry Winston", "Chopard"],
    },
    "restaurant": {
        "prompts": [
            "Best restaurants nearby",
            "Top rated restaurants",
            "Where to eat tonight"
        ],
        "known_brands": [],
    },
    "saas": {
        "prompts": [
            "Best SaaS tools for business",
            "Top software solutions",
            "Must-have business software"
        ],
        "known_brands": [],
    },
    "ecommerce": {
        "prompts": [
            "Best online stores",
            "Top ecommerce websites",
            "Where to shop online"
        ],
        "known_brands": ["Amazon", "eBay", "Shopify", "Etsy", "Walmart"],
    },
    "default": {
        "prompts": [
            "What are the best options?",
            "Top brands in 2025",
            "Best products to buy"
        ],
        "known_brands": [],
    }
}


def get_category_config(category: str) -> dict:
    """Get configuration for a category, falling back to default"""
    category_lower = category.lower()
    
    # Try exact match
    if category_lower in CATEGORY_CONFIG:
        return CATEGORY_CONFIG[category_lower]
    
    # Try partial match
    for key in CATEGORY_CONFIG:
        if key in category_lower or category_lower in key:
            return CATEGORY_CONFIG[key]
    
    return CATEGORY_CONFIG["default"]

