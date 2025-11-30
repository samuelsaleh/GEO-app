"""
Competitive Testing API

Endpoints for freemium competitive visibility testing:
- FREE: Quick Check (5 categories, 2 AI models)
- PAID: Full Test (5 categories, 6 AI models, competitor ranking)
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging
import os

from app.services.visibility_monitor import visibility_monitor, AI_MODELS, FREE_MODELS, PAID_MODELS
from app.services.email_service import email_service
from app.services.stripe_service import stripe_service

router = APIRouter()
logger = logging.getLogger(__name__)


# =============================================================================
# REQUEST/RESPONSE MODELS
# =============================================================================

class CreatePaymentRequest(BaseModel):
    """Request to create a payment intent"""
    email: EmailStr
    product: str  # "competitive_test" or "full_audit"
    brand_name: Optional[str] = None
    category: Optional[str] = None


class VerifyPaymentRequest(BaseModel):
    """Request to verify a payment"""
    payment_intent_id: str


class PaidTestRequest(BaseModel):
    """Request for paid competitive test"""
    brand: str
    category: str
    email: EmailStr
    payment_intent_id: str
    competitors: Optional[List[str]] = None
    prompts: Optional[Dict[str, str]] = None


class CompetitorRanking(BaseModel):
    """Individual competitor in ranking"""
    rank: int
    brand: str
    visibility_score: int
    grade: str
    mention_rate: float
    is_user: bool = False


class PaidTestResponse(BaseModel):
    """Response from paid competitive test"""
    success: bool
    user_brand: str
    user_rank: int
    user_score: int
    user_grade: str
    total_competitors: int
    rankings: List[CompetitorRanking]
    category_results: List[Dict[str, Any]]
    insights: List[str]
    recommendations: List[str]
    tested_at: str
    models_tested: int
    tier: str = "paid"


# =============================================================================
# PAYMENT ENDPOINTS
# =============================================================================

@router.get("/products")
async def get_products():
    """
    Get available products and pricing.
    
    Returns all Creed products with current pricing.
    """
    return {
        "products": stripe_service.get_products_list(),
        "currency": "EUR"
    }


@router.post("/create-payment")
async def create_payment(request: CreatePaymentRequest):
    """
    Create a Stripe payment intent.
    
    Used to initiate payment before running paid tests.
    Returns client_secret for Stripe Elements.
    
    Products:
    - competitive_test: €97
    - full_audit: €2,400
    """
    try:
        # Map product names to IDs
        product_map = {
            "competitive_test": "competitive_test",
            "full_audit": "full_audit",
            "monitoring_3mo": "monitoring_3mo",
            "monitoring_12mo": "monitoring_12mo"
        }
        
        product_id = product_map.get(request.product)
        if not product_id:
            raise HTTPException(status_code=400, detail=f"Invalid product: {request.product}")
        
        payment = stripe_service.create_payment_intent(
            product_id=product_id,
            email=request.email,
            metadata={
                "brand_name": request.brand_name or "",
                "category": request.category or ""
            }
        )
        
        return payment
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Payment creation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create payment")


@router.post("/verify-payment")
async def verify_payment(request: VerifyPaymentRequest):
    """
    Verify a payment was successful.
    
    Called before running paid features to confirm payment.
    """
    try:
        result = stripe_service.verify_payment(request.payment_intent_id)
        return result
        
    except Exception as e:
        logger.error(f"Payment verification error: {e}")
        raise HTTPException(status_code=500, detail="Failed to verify payment")


@router.post("/create-checkout")
async def create_checkout_session(
    product: str,
    email: str,
    brand_name: Optional[str] = None
):
    """
    Create a Stripe Checkout session (redirect to hosted payment page).
    
    Alternative to embedded payment - redirects to Stripe's hosted page.
    """
    try:
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        
        checkout_url = stripe_service.create_checkout_session(
            product_id=product,
            success_url=f"{frontend_url}/tools/ai-visibility?payment=success&session={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{frontend_url}/tools/ai-visibility?payment=cancelled",
            email=email,
            metadata={"brand_name": brand_name or ""}
        )
        
        return {"checkout_url": checkout_url}
        
    except Exception as e:
        logger.error(f"Checkout session error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create checkout session")


# =============================================================================
# PAID COMPETITIVE TEST
# =============================================================================

@router.post("/full-test", response_model=PaidTestResponse)
async def run_paid_competitive_test(
    request: PaidTestRequest,
    background_tasks: BackgroundTasks
):
    """
    🏆 PAID COMPETITIVE TEST (€97)
    
    Full competitive visibility test:
    - Tests across ALL 6 AI models
    - Compares against up to 10 competitors
    - Returns detailed rankings
    - Sends PDF report via email
    
    Requires valid payment_intent_id from /create-payment endpoint.
    
    Flow:
    1. Verify payment
    2. Discover/use competitors
    3. Test user brand + competitors across 6 models
    4. Calculate rankings
    5. Generate insights
    6. Email report (background)
    7. Return results
    """
    try:
        # 1. Verify payment
        payment = stripe_service.verify_payment(request.payment_intent_id)
        if not payment.get("success"):
            raise HTTPException(
                status_code=402,
                detail="Payment required. Please complete payment first."
            )
        
        logger.info(f"Paid test for {request.brand} - payment verified")
        
        # 2. Get competitors (use provided or discover)
        competitors = request.competitors or []
        if len(competitors) < 5:
            # Auto-discover more competitors
            from app.services.competitor_analyzer import competitor_analyzer
            discovered = await competitor_analyzer.discover_top_competitors(
                brand=request.brand,
                category=request.category
            )
            # Add discovered competitors (up to 10 total)
            for comp in discovered.local_competitors + discovered.global_competitors:
                if comp.name not in competitors and len(competitors) < 10:
                    competitors.append(comp.name)
        
        # 3. Define the 5 fixed categories
        categories = [
            {"id": "recommendation", "label": "🎯 Recommendation", "prompt": request.prompts.get("recommendation", f"What {request.category} do you recommend?") if request.prompts else f"What {request.category} do you recommend?"},
            {"id": "best_of", "label": "🏆 Best Of", "prompt": request.prompts.get("best_of", f"What is the best {request.category}?") if request.prompts else f"What is the best {request.category}?"},
            {"id": "comparison", "label": "⚖️ Comparison", "prompt": request.prompts.get("comparison", f"Compare different {request.category} options") if request.prompts else f"Compare different {request.category} options"},
            {"id": "problem_solution", "label": "🔧 Problem/Solution", "prompt": request.prompts.get("problem_solution", f"How do I find the best {request.category}?") if request.prompts else f"How do I find the best {request.category}?"},
            {"id": "alternative", "label": "🔄 Alternative", "prompt": request.prompts.get("alternative", f"What are alternatives to {competitors[0] if competitors else 'the market leader'}?") if request.prompts else f"What are alternatives to {competitors[0] if competitors else 'the market leader'}?"}
        ]
        
        # 4. Test all brands (user + competitors) across all models
        all_brands = [request.brand] + competitors[:10]
        brand_scores: Dict[str, Dict] = {}
        category_results = []
        
        for category in categories:
            cat_result = {
                "category": category["id"],
                "categoryLabel": category["label"],
                "prompt": category["prompt"],
                "brand_results": {}
            }
            
            # Test this category across all models
            result = await visibility_monitor.test_across_models(
                prompt=category["prompt"],
                brand=request.brand,
                competitors=competitors,
                models_to_test=PAID_MODELS  # All 6 models
            )
            
            cat_result["user_score"] = int(result.mention_rate)
            cat_result["results"] = [r.dict() for r in result.results]
            
            # Initialize brand scores
            if request.brand not in brand_scores:
                brand_scores[request.brand] = {"mentions": 0, "total": 0}
            brand_scores[request.brand]["mentions"] += result.models_mentioning
            brand_scores[request.brand]["total"] += result.models_tested
            
            # Test competitors (simplified - check if mentioned in same responses)
            for comp in competitors[:10]:
                comp_mentioned = sum(1 for r in result.results if comp.lower() in r.full_response.lower())
                if comp not in brand_scores:
                    brand_scores[comp] = {"mentions": 0, "total": 0}
                brand_scores[comp]["mentions"] += comp_mentioned
                brand_scores[comp]["total"] += len(result.results)
            
            category_results.append(cat_result)
        
        # 5. Calculate rankings
        rankings = []
        for brand, scores in brand_scores.items():
            visibility = int((scores["mentions"] / scores["total"]) * 100) if scores["total"] > 0 else 0
            rankings.append({
                "brand": brand,
                "score": visibility,
                "grade": _calculate_grade(visibility),
                "is_user": brand == request.brand
            })
        
        # Sort by score descending
        rankings.sort(key=lambda x: x["score"], reverse=True)
        
        # Add ranks
        ranking_models = []
        for i, r in enumerate(rankings):
            ranking_models.append(CompetitorRanking(
                rank=i + 1,
                brand=r["brand"],
                visibility_score=r["score"],
                grade=r["grade"],
                mention_rate=r["score"] / 100,
                is_user=r["is_user"]
            ))
        
        # Find user's position
        user_ranking = next((r for r in ranking_models if r.is_user), None)
        user_rank = user_ranking.rank if user_ranking else len(rankings)
        user_score = user_ranking.visibility_score if user_ranking else 0
        user_grade = user_ranking.grade if user_ranking else "F"
        
        # 6. Generate insights
        insights = _generate_competitive_insights(
            user_rank=user_rank,
            total=len(rankings),
            user_score=user_score,
            rankings=ranking_models
        )
        
        recommendations = _generate_competitive_recommendations(user_score, user_rank, len(rankings))
        
        # 7. Send email report in background
        background_tasks.add_task(
            _send_paid_report_email,
            email=request.email,
            brand=request.brand,
            score=user_score,
            grade=user_grade,
            rank=user_rank,
            total=len(rankings),
            rankings=rankings
        )
        
        return PaidTestResponse(
            success=True,
            user_brand=request.brand,
            user_rank=user_rank,
            user_score=user_score,
            user_grade=user_grade,
            total_competitors=len(rankings),
            rankings=ranking_models,
            category_results=category_results,
            insights=insights,
            recommendations=recommendations,
            tested_at=datetime.utcnow().isoformat(),
            models_tested=len(PAID_MODELS)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in paid competitive test: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def _calculate_grade(percentage: int) -> str:
    """Calculate letter grade from visibility percentage"""
    if percentage >= 80:
        return "A"
    elif percentage >= 60:
        return "B"
    elif percentage >= 40:
        return "C"
    elif percentage >= 20:
        return "D"
    else:
        return "F"


def _generate_competitive_insights(
    user_rank: int,
    total: int,
    user_score: int,
    rankings: List[CompetitorRanking]
) -> List[str]:
    """Generate insights for competitive test"""
    insights = []
    
    if user_rank == 1:
        insights.append(f"🏆 Congratulations! You rank #1 out of {total} brands tested!")
        insights.append(f"Your {user_score}% visibility means AI recommends you frequently.")
    else:
        leader = rankings[0] if rankings else None
        if leader:
            gap = leader.visibility_score - user_score
            insights.append(f"📊 You rank #{user_rank} out of {total} brands")
            insights.append(f"Gap to leader ({leader.brand}): {gap} percentage points")
    
    # Position insights
    if user_rank <= 3:
        insights.append("💪 You're in the top 3 - strong competitive position")
    elif user_rank <= total // 2:
        insights.append("📈 You're in the top half - room to improve")
    else:
        insights.append("⚠️ You're in the bottom half - significant work needed")
    
    # Score interpretation
    insights.append(f"Your {user_score}% score means AI mentions you in {user_score}% of relevant queries")
    
    return insights


def _generate_competitive_recommendations(score: int, rank: int, total: int) -> List[str]:
    """Generate recommendations based on competitive position"""
    recs = []
    
    if score < 30:
        recs.append("🚨 Priority: Build foundational AI presence with structured content")
        recs.append("Add comprehensive FAQ sections answering common questions")
        recs.append("Implement schema markup for better AI understanding")
    elif score < 50:
        recs.append("📝 Focus: Improve content depth and authority signals")
        recs.append("Create detailed comparison content vs top competitors")
        recs.append("Add expert-authored guides in your category")
    elif score < 70:
        recs.append("🎯 Optimize: Fine-tune content for specific query types")
        recs.append("Strengthen weak categories identified in the breakdown")
        recs.append("Monitor competitor content strategies")
    else:
        recs.append("🏆 Maintain: Protect your strong position")
        recs.append("Monitor for competitors gaining ground")
        recs.append("Expand into adjacent query categories")
    
    if rank > total // 2:
        recs.append("📊 Analysis: Study top 3 competitors' content strategies")
    
    return recs[:5]  # Limit to 5 recommendations


async def _send_paid_report_email(
    email: str,
    brand: str,
    score: int,
    grade: str,
    rank: int,
    total: int,
    rankings: List[dict]
):
    """Send paid test results email"""
    try:
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        
        # Build rankings HTML
        rankings_html = ""
        for idx, r in enumerate(rankings[:10]):
            is_user = "background: #f3e8ff; font-weight: bold;" if r.get("is_user") else ""
            rankings_html += f"""
            <tr style="{is_user}">
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">#{idx + 1}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">{r['brand']} {'(You)' if r.get('is_user') else ''}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">{r['score']}%</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">{r['grade']}</td>
            </tr>
            """
        
        subject = f"Your Competitive Ranking: #{rank} of {total} - {brand}"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }}
                table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
                th {{ background: #f3f4f6; padding: 10px; text-align: left; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Competitive Visibility Report</h1>
                    <p style="font-size: 48px; font-weight: bold; margin: 20px 0;">#{rank}</p>
                    <p>out of {total} competitors • Score: {score}% (Grade {grade})</p>
                </div>
                
                <div class="content">
                    <h2>Full Rankings</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Brand</th>
                                <th>Score</th>
                                <th>Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rankings_html}
                        </tbody>
                    </table>
                    
                    <h3>What's Next?</h3>
                    <p>This report shows where you stand. Want help improving your ranking?</p>
                    
                    <center>
                        <a href="{frontend_url}/pricing" style="background: #7c3aed; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">
                            Get Full Audit + Implementation Plan - €2,400
                        </a>
                    </center>
                    
                    <p>Questions? Reply to this email.</p>
                    <p>— The Creed Team</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        email_service.send_email(email, subject, html_content)
        logger.info(f"Sent paid report email to {email}")
        
    except Exception as e:
        logger.error(f"Failed to send paid report email: {e}")

