"""
Speed Test Models

Pydantic models for the AI Visibility Score feature.
Includes BrandContext for smart prompt generation.
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


# =============================================================================
# BRAND CONTEXT - Extracted from website analysis
# =============================================================================

class BrandContext(BaseModel):
    """
    Complete context about a brand, extracted from website analysis.
    Used to generate smart, relevant prompts.
    """
    brand_name: str                         # "Dinh Van"
    website_url: Optional[str] = None       # "https://dinhvan.com"
    
    # What they sell
    product_category: str                   # "luxury French jewelry"
    product_types: List[str] = []           # ["engagement rings", "necklaces", "bracelets"]
    
    # Brand identity
    brand_description: str = ""             # "Parisian jewelry house since 1965..."
    unique_selling_points: List[str] = []   # ["French craftsmanship", "minimalist design"]
    target_audience: str = ""               # "Affluent customers seeking luxury jewelry"
    
    # Market position
    price_range: str = ""                   # "high-end luxury ($1,000-$50,000)"
    known_competitors: List[str] = []       # ["Cartier", "Van Cleef", "Boucheron"]
    
    # Location
    location: Optional[str] = None          # "Paris, France"
    serves_location: Optional[str] = None   # "Worldwide shipping"
    
    # Generated questions
    suggested_questions: List[str] = []     # Questions we'll ask AI


class AnalyzeSiteRequest(BaseModel):
    """Request to analyze a website and extract brand context"""
    brand_name: str = Field(..., min_length=1, max_length=100)
    website_url: str = Field(..., min_length=5, max_length=500)
    additional_context: Optional[str] = None  # User can add extra info


class AnalyzeSiteResponse(BaseModel):
    """Response from website analysis"""
    success: bool
    brand_context: Optional[BrandContext] = None
    suggested_questions: List[str] = []
    detected_category: str = ""
    detected_competitors: List[str] = []
    error: Optional[str] = None


# =============================================================================
# PROMPT TEMPLATES - Context-aware prompt generation
# =============================================================================

PROMPT_TEMPLATES = {
    PromptCategory.RECOMMENDATION: {
        "system_prompt": """You are a helpful shopping advisor. When recommending products:
1. Always mention specific brand names
2. Explain WHY you recommend each brand
3. List brands in order of your recommendation
4. Be honest and helpful based on quality, value, and reputation.""",
        
        "user_templates": [
            "What are the best {product_category}?",
            "Top {product_category} brands to consider in 2025",
            "I'm looking for {product_category}. What brands would you recommend?",
            "Which {product_category} brands have the best reputation?",
        ],
        
        "context_template": """A customer is looking for recommendations on {product_category}.

What they're looking for:
- Product type: {product_category}
- Key factors they care about: quality, reputation, value
{location_context}

Please recommend specific brands and explain your reasoning."""
    },
    
    PromptCategory.REPUTATION: {
        "system_prompt": """You are a helpful product research assistant. When asked about brands:
1. Give honest, balanced assessments
2. Mention both strengths and areas for improvement
3. Compare to alternatives when relevant
4. Be specific and factual.""",
        
        "user_templates": [
            "Is {brand_name} good for {product_category}? What are alternatives?",
            "What do people think about {brand_name}?",
            "Should I buy from {brand_name}? Are there better options?",
            "{brand_name} review - is it worth it?",
        ],
        
        "context_template": """A customer is researching {brand_name}, which sells {product_category}.

About {brand_name}:
- Category: {product_category}
{brand_description_context}
{website_context}

Please provide an honest assessment and mention alternatives if relevant."""
    },
    
    PromptCategory.PURCHASE: {
        "system_prompt": """You are a shopping assistant helping customers decide where to buy.
1. Recommend specific brands and retailers
2. Consider factors like price, quality, and convenience
3. Give actionable advice on where to purchase
4. Be specific with brand names.""",
        
        "user_templates": [
            "Where should I buy {product_category}? What brands do you recommend?",
            "Best places to buy {product_category}",
            "I want to buy {product_category}. Which brands and stores do you suggest?",
            "Where can I find quality {product_category}?",
        ],
        
        "context_template": """A customer wants to purchase {product_category}.

Their requirements:
- Looking for: {product_category}
{location_context}
{price_context}

Recommend specific brands and where to buy them."""
    },
    
    PromptCategory.COMPARISON: {
        "system_prompt": """You are a product comparison expert. When comparing brands:
1. Be objective and fair
2. List specific pros and cons
3. Explain who each brand is best for
4. Don't favor any particular brand unfairly.""",
        
        "user_templates": [
            "{brand_name} vs competitors - how does it compare?",
            "Compare the top {product_category} brands",
            "Is {brand_name} better than {competitor_1}?",
            "Best {product_category}: comparing the top brands",
        ],
        
        "context_template": """A customer is comparing {product_category} brands.

Brands to consider:
- {brand_name} (the brand being evaluated)
{competitors_context}

Compare objectively, mentioning strengths and weaknesses of each."""
    }
}


def build_prompt_with_context(
    template_category: PromptCategory,
    brand_context: BrandContext,
    question_template: str
) -> tuple[str, str]:
    """
    Build a complete prompt with system message and user message.
    
    Returns:
        (system_prompt, user_prompt)
    """
    template = PROMPT_TEMPLATES[template_category]
    
    # Build context parts
    location_context = f"- Location: {brand_context.location}" if brand_context.location else ""
    price_context = f"- Budget: {brand_context.price_range}" if brand_context.price_range else ""
    website_context = f"- Website: {brand_context.website_url}" if brand_context.website_url else ""
    brand_description_context = f"- Known for: {brand_context.brand_description}" if brand_context.brand_description else ""
    
    competitors_context = ""
    if brand_context.known_competitors:
        competitors_context = "- Known competitors: " + ", ".join(brand_context.known_competitors[:5])
    
    # Fill in the question template
    competitor_1 = brand_context.known_competitors[0] if brand_context.known_competitors else "competitors"
    
    user_question = question_template.format(
        brand_name=brand_context.brand_name,
        product_category=brand_context.product_category,
        competitor_1=competitor_1,
        location=brand_context.location or "your area",
    )
    
    # Build the full user prompt with context
    context_filled = template["context_template"].format(
        brand_name=brand_context.brand_name,
        product_category=brand_context.product_category,
        location_context=location_context,
        price_context=price_context,
        website_context=website_context,
        brand_description_context=brand_description_context,
        competitors_context=competitors_context,
    )
    
    full_user_prompt = f"{context_filled}\n\nQuestion: {user_question}"
    
    return template["system_prompt"], full_user_prompt


def generate_questions_for_brand(brand_context: BrandContext) -> List[Dict[str, Any]]:
    """
    Generate a list of questions to test based on brand context.
    
    Returns list of {"question": str, "category": PromptCategory, "template": str}
    """
    questions = []
    
    # Pick 1-2 questions from each category
    for category, template in PROMPT_TEMPLATES.items():
        user_templates = template["user_templates"]
        
        # Take first 1-2 templates from each category
        for tmpl in user_templates[:2]:
            competitor_1 = brand_context.known_competitors[0] if brand_context.known_competitors else "competitors"
            
            filled_question = tmpl.format(
                brand_name=brand_context.brand_name,
                product_category=brand_context.product_category,
                competitor_1=competitor_1,
                location=brand_context.location or "your area",
            )
            
            questions.append({
                "question": filled_question,
                "category": category,
                "template": tmpl
            })
    
    # Return 4-6 questions for the test
    return questions[:6]


# =============================================================================
# SCORE REQUEST/RESPONSE MODELS
# =============================================================================

class ScoreRequest(BaseModel):
    """Request to run an AI visibility score test"""
    brand: str = Field(..., description="Brand name to test", min_length=1, max_length=100)
    category: str = Field(..., description="Product/service description (be specific!)", min_length=1, max_length=200)
    location: Optional[str] = Field(None, description="Optional location for local businesses")
    website_url: Optional[str] = Field(None, description="Website URL for context")
    
    # Optional: pre-analyzed brand context
    brand_context: Optional[BrandContext] = None
    
    # Optional: custom questions (from website analysis)
    custom_questions: Optional[List[str]] = None


class ModelResult(BaseModel):
    """Result from a single AI model query"""
    model_id: str                           # "gpt-5.1-mini"
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
    
    class Config:
        # Allow model_ prefix fields
        protected_namespaces = ()


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
    
    class Config:
        protected_namespaces = ()


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
    you_vs_top: Optional[Dict[str, Any]] = None
    
    # The "aha" moment
    worst_prompt: Optional[Dict[str, Any]] = None
    killer_quote: Optional[str] = None
    
    # Example AI response
    example_response: Optional[Dict[str, Any]] = None
    
    # Sharing
    share_text: str = ""
    share_url: Optional[str] = None
    
    # Metadata
    tested_at: datetime = Field(default_factory=datetime.now)
    test_duration_ms: int = 0
    
    # Questions that were tested (for display)
    questions_tested: List[str] = []
    
    class Config:
        protected_namespaces = ()
