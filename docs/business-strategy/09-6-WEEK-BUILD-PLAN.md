# 🚀 Complete 6-Week Build Plan for Creed Freemium Competitive Testing

> **Give this entire document to Cursor/Claude Opus to implement**

---

## 📋 Project Overview

**Goal:** Add freemium competitive visibility testing to the existing Creed platform

### Business Model

| Tier | Price | Features |
|------|-------|----------|
| **FREE** | €0 | Quick Check (3 prompts, 1 AI model, basic visibility score) |
| **Competitive Test** | €97 | 10 prompts, 2 AI models, full rankings vs 10 competitors |
| **Full Audit** | €2,400 | Includes competitive test + implementation plan + call |

### Tech Stack (Already Exists)

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Backend:** FastAPI (Python), Pydantic
- **Existing Services:** `visibility_monitor.py`, `competitor_analyzer.py`, `ai_service.py`
- **Deployment:** Vercel (frontend) + Railway (backend)

---

## 🗓️ 6-WEEK ROADMAP

### WEEK 1-2: Free Quick Check Tool
Build the lead magnet that captures emails and shows the problem.

**Deliverables:**
- Backend endpoint: `/api/competitive/quick-check` (FREE tier)
- Frontend page: `/tools/quick-check`
- Email capture integration
- Results display with upgrade CTA

**Files to Create/Modify:** 6 files

---

### WEEK 3-4: €97 Competitive Test + Stripe
Build the paid diagnostic tool with payment integration.

**Deliverables:**
- Backend endpoint: `/api/competitive/full-test` (PAID tier)
- Stripe payment integration
- Full results page with rankings
- PDF report generation
- Email delivery

**Files to Create/Modify:** 8 files

---

### WEEK 5: Pricing Pages + Email Automation
Marketing automation and conversion optimization.

**Deliverables:**
- Updated pricing page with bundles
- Email sequence setup (5 emails)
- Upsell flows
- Analytics tracking

**Files to Create/Modify:** 4 files

---

### WEEK 6: Testing + Deployment
Review code, fix bugs, deploy to production.

**Deliverables:**
- End-to-end testing
- Bug fixes
- Production deployment
- Monitoring setup

---

## 📁 COMPLETE FILE SPECIFICATIONS

---

## WEEK 1-2: FREE QUICK CHECK TOOL

### File 1: Backend - Free Quick Check Endpoint

**Path:** `backend/app/api/competitive.py` (NEW FILE)

**Purpose:** API endpoint for free competitive visibility check

```python
"""
Competitive Visibility Testing API
Endpoints for free and paid competitive analysis
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
import logging

from app.services.visibility_monitor import visibility_monitor
from app.services.competitor_analyzer import competitor_analyzer
from app.services.email_service import email_service

router = APIRouter()
logger = logging.getLogger(__name__)


class QuickCheckRequest(BaseModel):
    """Free quick check request"""
    brand: str
    category: str  # e.g., "CRM software", "project management"
    email: EmailStr
    website_url: Optional[str] = None


class QuickCheckResponse(BaseModel):
    """Free quick check response"""
    brand: str
    category: str
    visibility_score: int  # 0-100
    grade: str  # A, B, C, D, F
    mentions: int
    total_prompts: int
    insights: List[str]
    upgrade_message: str
    tested_at: str
    tier: str = "free"


@router.post("/quick-check", response_model=QuickCheckResponse)
async def quick_check(request: QuickCheckRequest, background_tasks: BackgroundTasks):
    """
    FREE Quick Check
    
    Tests brand visibility across 3 strategic prompts on Claude Sonnet.
    Shows basic visibility score and creates FOMO for paid upgrade.
    
    Flow:
    1. Generate 3 neutral prompts for the category
    2. Test each prompt on Claude Sonnet
    3. Check if brand is mentioned
    4. Calculate visibility score
    5. Send email with results + upgrade offer
    6. Return results with locked insights
    """
    try:
        logger.info(f"Quick check requested for {request.brand} in {request.category}")
        
        # Generate 3 neutral prompts for this category
        prompts = _generate_free_prompts(request.category)
        
        # Test each prompt
        results = []
        mention_count = 0
        
        for prompt in prompts:
            # Use existing visibility_monitor to test
            result = await visibility_monitor.test_prompt(
                prompt=prompt,
                brand=request.brand,
                competitors=[],
                model="claude-sonnet"
            )
            
            is_mentioned = result.brand_mentioned
            if is_mentioned:
                mention_count += 1
                
            results.append({
                "prompt": prompt,
                "mentioned": is_mentioned
            })
        
        # Calculate visibility score
        visibility_score = int((mention_count / len(prompts)) * 100)
        
        # Determine grade
        grade = _calculate_grade(visibility_score)
        
        # Generate insights
        insights = _generate_free_insights(visibility_score, mention_count, len(prompts))
        
        # Upgrade message
        upgrade_message = _get_upgrade_message(visibility_score)
        
        # Send email in background
        background_tasks.add_task(
            email_service.send_quick_check_results,
            to_email=request.email,
            brand=request.brand,
            score=visibility_score,
            grade=grade
        )
        
        return QuickCheckResponse(
            brand=request.brand,
            category=request.category,
            visibility_score=visibility_score,
            grade=grade,
            mentions=mention_count,
            total_prompts=len(prompts),
            insights=insights,
            upgrade_message=upgrade_message,
            tested_at=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Error in quick check: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def _generate_free_prompts(category: str) -> List[str]:
    """Generate 3 neutral prompts for free tier"""
    
    # Template-based prompt generation
    templates = [
        f"What are the best {category} options?",
        f"Which {category} should I use for my business?",
        f"Compare different {category} solutions"
    ]
    
    return templates[:3]


def _calculate_grade(percentage: int) -> str:
    """Calculate letter grade from visibility percentage"""
    if percentage >= 90:
        return "A"
    elif percentage >= 75:
        return "B"
    elif percentage >= 60:
        return "C"
    elif percentage >= 40:
        return "D"
    else:
        return "F"


def _generate_free_insights(visibility: int, mentions: int, total: int) -> List[str]:
    """Generate insights for free tier (limited)"""
    insights = []
    
    if visibility < 40:
        insights.append(f"🔴 Critical: Your brand appears in only {mentions} out of {total} AI responses ({visibility}%)")
        insights.append(f"This means {100 - visibility}% of potential customers asking AI won't hear about you")
    elif visibility < 70:
        insights.append(f"🟡 Warning: Moderate visibility ({visibility}%) - room for improvement")
    else:
        insights.append(f"🟢 Good visibility ({visibility}%) but competitors may be ahead")
    
    # Locked insights (create FOMO)
    insights.append("🔒 Unlock: See how you rank vs 10 competitors")
    insights.append("🔒 Unlock: Detailed breakdown by query type")
    insights.append("🔒 Unlock: Specific recommendations to improve")
    
    return insights


def _get_upgrade_message(visibility: int) -> str:
    """Get contextual upgrade message"""
    if visibility < 40:
        return "Want to know how you compare to competitors? Get the full competitive analysis for €97"
    elif visibility < 70:
        return "See exactly where competitors are beating you. Upgrade to full report for €97"
    else:
        return "You're doing well! See your ranking and find gaps to become #1 for €97"
```

**What this does:**
- Takes brand + category + email
- Generates 3 neutral prompts
- Tests on Claude Sonnet only
- Shows visibility score (0-100) + grade (A-F)
- Shows limited insights with 🔒 locked items
- Sends email with results
- Returns upgrade CTA

---

### File 2: Frontend - Free Quick Check Page

**Path:** `frontend/src/app/tools/quick-check/page.tsx` (NEW FILE)

**Purpose:** User-facing free tool page

```tsx
'use client'

import { useState } from 'react'
import { CheckCircle, AlertCircle, Lock, TrendingUp } from 'lucide-react'

export default function QuickCheckPage() {
  const [formData, setFormData] = useState({
    brand: '',
    category: '',
    email: '',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/competitive/quick-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Free AI Visibility Check
          </h1>
          <p className="text-xl text-slate-600">
            See if AI search engines know about your brand (takes 30 seconds)
          </p>
        </div>

        {!result ? (
          /* Input Form */
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Your Brand Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Acme Corp"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., CRM software, project management"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email (to send results)
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Testing your visibility...' : 'Check My Visibility (FREE)'}
              </button>

              <p className="text-sm text-slate-500 text-center">
                ✅ No credit card required  •  ⚡ Results in 30 seconds
              </p>
            </form>
          </div>
        ) : (
          /* Results Display */
          <div className="space-y-6">
            
            {/* Score Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-6">
                <div className="text-6xl font-bold text-slate-900 mb-2">
                  {result.visibility_score}%
                </div>
                <div className="text-2xl font-semibold text-slate-600">
                  Visibility Score (Grade: {result.grade})
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-slate-900">{result.mentions}/{result.total_prompts}</div>
                  <div className="text-sm text-slate-600">AI Mentions</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-slate-900">{result.grade}</div>
                  <div className="text-sm text-slate-600">Grade</div>
                </div>
              </div>

              {/* Insights */}
              <div className="space-y-3 mb-6">
                {result.insights.map((insight: string, index: number) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-3 rounded-lg ${
                      insight.includes('🔒') ? 'bg-slate-100 opacity-60' : 'bg-blue-50'
                    }`}
                  >
                    {insight.includes('🔒') ? (
                      <Lock className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                    ) : insight.includes('🔴') ? (
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    )}
                    <p className="text-sm text-slate-700">{insight.replace(/🔒|🔴|🟡|🟢/, '').trim()}</p>
                  </div>
                ))}
              </div>

              {/* Upgrade CTA */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex items-start gap-4">
                  <TrendingUp className="w-8 h-8 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      Want to see how you rank vs competitors?
                    </h3>
                    <p className="text-blue-100 mb-4">
                      {result.upgrade_message}
                    </p>
                    <div className="flex gap-3">
                      <a
                        href="/tools/competitive-test"
                        className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition"
                      >
                        Get Full Report - €97
                      </a>
                      <a
                        href="/pricing"
                        className="bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-800 transition"
                      >
                        See All Options
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Another Brand */}
            <div className="text-center">
              <button
                onClick={() => setResult(null)}
                className="text-blue-600 hover:underline"
              >
                ← Test another brand
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
```

**What this does:**
- Simple 3-field form (brand, category, email)
- Shows loading state while testing
- Displays results with score, grade, insights
- Shows locked insights (creates FOMO)
- Big upgrade CTA with contextual messaging
- "Test another brand" option

---

### File 3: Email Template for Quick Check

**Path:** `backend/app/services/email_service.py` (ADD METHOD)

Add this method to the existing EmailService class:

```python
def send_quick_check_results(self, to_email: str, brand: str, score: int, grade: str) -> bool:
    """Send quick check results email with upgrade offer"""
    
    subject = f"Your AI Visibility Score: {score}% (Grade: {grade})"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .score {{ font-size: 48px; font-weight: bold; margin: 10px 0; }}
            .content {{ background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }}
            .cta-button {{ background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; font-weight: bold; }}
            .insight {{ background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #667eea; border-radius: 5px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Your AI Visibility Results</h1>
                <div class="score">{score}%</div>
                <p>Grade: {grade}</p>
            </div>
            
            <div class="content">
                <h2>Hi there,</h2>
                <p>We tested how often AI search engines (like ChatGPT) mention <strong>{brand}</strong> when asked about your category.</p>
                
                <div class="insight">
                    <strong>What this means:</strong><br>
                    {'🟢 You have good visibility!' if score >= 70 else '🟡 You have moderate visibility.' if score >= 40 else '🔴 Your visibility is critically low.'}
                    <br><br>
                    {100 - score}% of potential customers asking AI for recommendations won't hear about you.
                </div>
                
                <h3>Want to know more?</h3>
                <p>This was just a quick check. Here's what you're missing:</p>
                <ul>
                    <li>🔒 How you rank vs 10 competitors</li>
                    <li>🔒 Which types of queries you're winning/losing</li>
                    <li>🔒 Specific recommendations to improve your score</li>
                    <li>🔒 Testing across multiple AI models (GPT-5.1, Claude, Gemini)</li>
                </ul>
                
                <center>
                    <a href="{settings.frontend_url}/tools/competitive-test" class="cta-button">
                        Get Full Competitive Report - €97
                    </a>
                </center>
                
                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                    Questions? Just reply to this email.<br>
                    - The Creed Team
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return self.send_email(to_email, subject, html_content)
```

---

### File 4: Update Main Router

**Path:** `backend/app/main.py` (MODIFY)

Add this line around line 56 where other routers are included:

```python
from app.api import competitive

# ... other includes ...

app.include_router(competitive.router, prefix="/api/competitive", tags=["Competitive Testing"])
```

---

### File 5: Navigation Link

**Path:** `frontend/src/app/page.tsx` (MODIFY)

Add link to Quick Check in the tools section (around line 200):

```tsx
<a href="/tools/quick-check" className="...">
  <h3>🎯 Free Visibility Check</h3>
  <p>See if AI knows your brand in 30 seconds</p>
</a>
```

---

### File 6: Environment Variables

**Path:** `backend/.env` (MODIFY)

Ensure these are set:

```bash
ANTHROPIC_API_KEY=your-key-here
FRONTEND_URL=http://localhost:3000  # or your production URL
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=your-email@gmail.com
```

---

## WEEK 3-4: PAID COMPETITIVE TEST + STRIPE

### File 7: Full Competitive Test Endpoint

**Path:** `backend/app/api/competitive.py` (ADD TO EXISTING FILE)

Add these models and endpoint:

```python
class CompetitiveTestRequest(BaseModel):
    """Paid competitive test request"""
    brand: str
    category: str
    email: EmailStr
    competitors: Optional[List[str]] = None  # Auto-discover if None
    payment_intent_id: str  # Stripe payment ID


class CompetitorRanking(BaseModel):
    """Individual competitor ranking"""
    rank: int
    brand: str
    visibility_score: int
    grade: str
    mention_rate: float
    avg_position: Optional[float] = None


class CompetitiveTestResponse(BaseModel):
    """Full competitive test response"""
    user_brand: str
    user_rank: int
    user_score: int
    user_grade: str
    total_competitors: int
    rankings: List[CompetitorRanking]
    category_breakdown: Dict[str, Any]
    insights: List[str]
    recommendations: List[str]
    tested_at: str
    tier: str = "paid"
    report_url: Optional[str] = None


@router.post("/full-test", response_model=CompetitiveTestResponse)
async def full_competitive_test(request: CompetitiveTestRequest, background_tasks: BackgroundTasks):
    """
    PAID Competitive Test (€97)
    
    Tests brand against 10 competitors across 10 prompts on 2 AI models.
    Returns complete rankings, insights, and recommendations.
    
    Flow:
    1. Verify Stripe payment
    2. Discover competitors (if not provided)
    3. Generate 10 neutral prompts
    4. Test on GPT-5.1 + Claude Sonnet (10 × 2 = 20 API calls)
    5. Calculate scores for all 11 brands
    6. Generate rankings
    7. Create PDF report
    8. Email report
    9. Return results
    """
    try:
        logger.info(f"Full test requested for {request.brand}")
        
        # 1. Verify payment (add Stripe verification here)
        # if not _verify_stripe_payment(request.payment_intent_id):
        #     raise HTTPException(status_code=402, detail="Payment required")
        
        # 2. Get competitors
        competitors = request.competitors
        if not competitors:
            # Auto-discover using existing service
            discovered = await competitor_analyzer.discover_competitors(
                company_name=request.brand,
                website_url="",  # Could collect this in form
                industry_keywords=[request.category]
            )
            competitors = [c["name"] for c in discovered[:10]]
        
        # 3. Generate 10 strategic prompts
        prompts = _generate_paid_prompts(request.category)
        
        # 4. Test all brands across all prompts
        all_brands = [request.brand] + competitors
        scores = {}
        
        for brand in all_brands:
            brand_mentions = 0
            brand_positions = []
            
            for prompt in prompts:
                # Test on GPT-5.1
                result_gpt = await visibility_monitor.test_prompt(
                    prompt=prompt,
                    brand=brand,
                    competitors=[],
                    model="gpt-5.1"
                )
                if result_gpt.brand_mentioned:
                    brand_mentions += 1
                    if result_gpt.position:
                        brand_positions.append(result_gpt.position)
                
                # Test on Claude
                result_claude = await visibility_monitor.test_prompt(
                    prompt=prompt,
                    brand=brand,
                    competitors=[],
                    model="claude-sonnet"
                )
                if result_claude.brand_mentioned:
                    brand_mentions += 1
                    if result_claude.position:
                        brand_positions.append(result_claude.position)
            
            # Calculate score
            total_tests = len(prompts) * 2  # 10 prompts × 2 models
            visibility = int((brand_mentions / total_tests) * 100)
            avg_position = sum(brand_positions) / len(brand_positions) if brand_positions else None
            
            scores[brand] = {
                "visibility": visibility,
                "avg_position": avg_position,
                "grade": _calculate_grade(visibility)
            }
        
        # 5. Generate rankings
        rankings = []
        sorted_brands = sorted(scores.items(), key=lambda x: x[1]["visibility"], reverse=True)
        
        for rank, (brand, data) in enumerate(sorted_brands, 1):
            rankings.append(CompetitorRanking(
                rank=rank,
                brand=brand,
                visibility_score=data["visibility"],
                grade=data["grade"],
                mention_rate=data["visibility"] / 100,
                avg_position=data["avg_position"]
            ))
        
        # Find user's rank
        user_rank = next(r.rank for r in rankings if r.brand == request.brand)
        user_score = scores[request.brand]["visibility"]
        user_grade = scores[request.brand]["grade"]
        
        # 6. Generate insights
        insights = _generate_paid_insights(user_rank, len(rankings), user_score, rankings)
        recommendations = _generate_recommendations(user_score, user_rank)
        
        # 7. Generate PDF report (background task)
        background_tasks.add_task(
            _generate_and_email_pdf,
            email=request.email,
            brand=request.brand,
            rankings=rankings,
            insights=insights
        )
        
        return CompetitiveTestResponse(
            user_brand=request.brand,
            user_rank=user_rank,
            user_score=user_score,
            user_grade=user_grade,
            total_competitors=len(rankings),
            rankings=rankings,
            category_breakdown={},  # Can add category analysis later
            insights=insights,
            recommendations=recommendations,
            tested_at=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Error in full test: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def _generate_paid_prompts(category: str) -> List[str]:
    """Generate 10 strategic prompts for paid tier"""
    templates = [
        # Recommendation (4)
        f"What {category} should I use?",
        f"Best {category} for my business?",
        f"Top {category} recommendations?",
        f"Which {category} do experts recommend?",
        # Comparison (3)
        f"Compare {category} options",
        f"What are the top {category} platforms?",
        f"{category} - what should I consider?",
        # Problem-solving (2)
        f"How to choose the right {category}?",
        f"What {category} solves [common problem]?",
        # Reviews (1)
        f"What are pros and cons of {category}?",
    ]
    return templates[:10]


def _generate_paid_insights(user_rank: int, total: int, score: int, rankings: List) -> List[str]:
    """Generate insights for paid tier"""
    insights = []
    
    if user_rank == 1:
        insights.append(f"🏆 Congratulations! You rank #1 out of {total} brands tested")
    else:
        leader = rankings[0]
        gap = leader.visibility_score - score
        insights.append(f"📊 You rank #{user_rank} out of {total} brands")
        insights.append(f"Gap to leader ({leader.brand}): {gap} points")
    
    # Category insights
    insights.append(f"Your visibility score ({score}%) means you appear in {score}% of AI responses")
    
    # Competitor insights
    ahead_count = user_rank - 1
    behind_count = total - user_rank
    insights.append(f"You're ahead of {behind_count} competitor(s) and behind {ahead_count}")
    
    return insights


def _generate_recommendations(score: int, rank: int) -> List[str]:
    """Generate actionable recommendations"""
    recs = []
    
    if score < 40:
        recs.append("Add comprehensive FAQ sections to your website")
        recs.append("Implement schema markup for better AI understanding")
        recs.append("Create how-to guides and tutorials")
    elif score < 70:
        recs.append("Optimize existing content for AI consumption")
        recs.append("Add more structured data (schema)")
        recs.append("Increase content depth on key topics")
    else:
        recs.append("Fine-tune positioning to beat top competitor")
        recs.append("Expand content coverage in weak categories")
        recs.append("Monitor and maintain your strong position")
    
    return recs


async def _generate_and_email_pdf(email: str, brand: str, rankings: List, insights: List):
    """Generate PDF report and email it (background task)"""
    # TODO: Implement PDF generation
    # For now, just send email with data
    await email_service.send_competitive_report(
        to_email=email,
        brand=brand,
        rankings=[r.dict() for r in rankings],
        insights=insights
    )
```

---

### File 8: Stripe Payment Integration

**Path:** `backend/app/services/stripe_service.py` (NEW FILE)

```python
"""Stripe payment service"""
import stripe
import os
from typing import Dict, Optional

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")


class StripeService:
    """Handle Stripe payments"""
    
    COMPETITIVE_TEST_PRICE = 9700  # €97.00 in cents
    FULL_AUDIT_PRICE = 240000  # €2,400 in cents
    
    def create_payment_intent(self, amount: int, email: str, description: str) -> Dict:
        """Create a Stripe payment intent"""
        try:
            intent = stripe.PaymentIntent.create(
                amount=amount,
                currency="eur",
                receipt_email=email,
                description=description,
                metadata={
                    "product": description,
                    "email": email
                }
            )
            return {
                "client_secret": intent.client_secret,
                "payment_intent_id": intent.id
            }
        except Exception as e:
            print(f"Stripe error: {e}")
            raise
    
    def verify_payment(self, payment_intent_id: str) -> bool:
        """Verify a payment was successful"""
        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            return intent.status == "succeeded"
        except:
            return False
    
    def create_checkout_session(self, price_id: str, success_url: str, cancel_url: str, email: str) -> str:
        """Create a Stripe Checkout session"""
        try:
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=[{
                    "price": price_id,
                    "quantity": 1,
                }],
                mode="payment",
                success_url=success_url,
                cancel_url=cancel_url,
                customer_email=email,
            )
            return session.url
        except Exception as e:
            print(f"Stripe checkout error: {e}")
            raise


stripe_service = StripeService()
```

---

### File 9: Stripe Payment Endpoint

**Path:** `backend/app/api/competitive.py` (ADD TO EXISTING)

```python
from app.services.stripe_service import stripe_service


class CreatePaymentRequest(BaseModel):
    """Request to create a payment"""
    email: EmailStr
    product: str  # "competitive_test" or "full_audit"


@router.post("/create-payment")
async def create_payment(request: CreatePaymentRequest):
    """Create a Stripe payment intent"""
    try:
        if request.product == "competitive_test":
            amount = stripe_service.COMPETITIVE_TEST_PRICE
            description = "Competitive Visibility Test"
        elif request.product == "full_audit":
            amount = stripe_service.FULL_AUDIT_PRICE
            description = "Full AI Visibility Audit"
        else:
            raise HTTPException(status_code=400, detail="Invalid product")
        
        payment = stripe_service.create_payment_intent(
            amount=amount,
            email=request.email,
            description=description
        )
        
        return payment
    except Exception as e:
        logger.error(f"Payment creation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
```

---

### File 10: Frontend - Competitive Test Page

**Path:** `frontend/src/app/tools/competitive-test/page.tsx` (NEW FILE)

```tsx
'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function CompetitiveTestPage() {
  const [step, setStep] = useState<'form' | 'payment' | 'results'>('form')
  const [formData, setFormData] = useState({
    brand: '',
    category: '',
    email: '',
  })
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const handlePayment = async () => {
    setLoading(true)
    
    try {
      // Create payment intent
      const paymentRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/competitive/create-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          product: 'competitive_test'
        }),
      })
      
      const { client_secret, payment_intent_id } = await paymentRes.json()
      
      // Confirm payment with Stripe
      const stripe = await stripePromise
      const { error, paymentIntent } = await stripe!.confirmCardPayment(client_secret)
      
      if (error) {
        alert(error.message)
        setLoading(false)
        return
      }
      
      if (paymentIntent.status === 'succeeded') {
        // Run the test
        const testRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/competitive/full-test`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            payment_intent_id: paymentIntent.id
          }),
        })
        
        const data = await testRes.json()
        setResults(data)
        setStep('results')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Something went wrong. Please contact support.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Competitive Visibility Test
          </h1>
          <p className="text-xl text-slate-600">
            See exactly where you rank vs 10 competitors • €97
          </p>
        </div>

        {step === 'form' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Step 1: Your Information</h2>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Your Brand Name"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Category (e.g., CRM software)"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg"
              />
              <input
                type="email"
                placeholder="Email for report"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>

            <button
              onClick={() => setStep('payment')}
              disabled={!formData.brand || !formData.category || !formData.email}
              className="w-full mt-6 bg-purple-600 text-white py-4 rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50"
            >
              Continue to Payment →
            </button>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-slate-700">
                ✅ Test against 10 competitors<br/>
                ✅ 10 strategic prompts × 2 AI models<br/>
                ✅ Full rankings + insights<br/>
                ✅ PDF report emailed to you
              </p>
            </div>
          </div>
        )}

        {step === 'payment' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Step 2: Payment</h2>
            <p className="mb-4">Complete payment to start your competitive analysis</p>
            
            {/* Add Stripe CardElement here */}
            
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full mt-6 bg-purple-600 text-white py-4 rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Pay €97 & Run Test'}
            </button>
          </div>
        )}

        {step === 'results' && results && (
          <div className="space-y-6">
            {/* Rankings Table */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-3xl font-bold mb-6">Your Rankings</h2>
              
              <div className="mb-8 p-6 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl">
                <div className="text-center">
                  <div className="text-5xl font-bold text-purple-900 mb-2">
                    #{results.user_rank}
                  </div>
                  <div className="text-xl text-purple-700">
                    out of {results.total_competitors} brands • Score: {results.user_score}% ({results.user_grade})
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {results.rankings.map((ranking: any, index: number) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                      ranking.brand === results.user_brand
                        ? 'bg-purple-50 border-purple-500'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-slate-400 w-8">
                        #{ranking.rank}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">
                          {ranking.brand}
                          {ranking.brand === results.user_brand && (
                            <span className="ml-2 text-xs bg-purple-500 text-white px-2 py-1 rounded">YOU</span>
                          )}
                        </div>
                        <div className="text-sm text-slate-500">
                          {ranking.visibility_score}% visibility • Grade {ranking.grade}
                        </div>
                      </div>
                    </div>
                    
                    {ranking.rank === 1 && <Trophy className="w-6 h-6 text-yellow-500" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Insights */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold mb-4">Key Insights</h3>
              <div className="space-y-3">
                {results.insights.map((insight: string, i: number) => (
                  <div key={i} className="p-3 bg-blue-50 rounded-lg text-slate-700">
                    {insight}
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold mb-4">Recommendations</h3>
              <div className="space-y-3">
                {results.recommendations.map((rec: string, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      {i + 1}
                    </div>
                    <p className="text-slate-700">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Upsell to Full Audit */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Want the Complete Fix?</h3>
              <p className="text-purple-100 mb-6">
                This test showed you WHERE you rank. Our Full Audit shows you HOW to fix it.
              </p>
              <a
                href="/pricing"
                className="inline-block bg-white text-purple-600 px-8 py-3 rounded-lg font-bold hover:bg-purple-50"
              >
                Get Full Audit - €2,400 →
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
```

---

## WEEK 5: PRICING & EMAIL AUTOMATION

### File 11: Updated Pricing Page

**Path:** `frontend/src/app/pricing/page.tsx` (MODIFY EXISTING)

Add bundle pricing section:

```tsx
// Add this section to existing pricing page

<div className="max-w-6xl mx-auto py-12">
  <h2 className="text-3xl font-bold text-center mb-12">Pricing Packages</h2>
  
  <div className="grid md:grid-cols-3 gap-8">
    
    {/* FREE */}
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h3 className="text-2xl font-bold mb-4">Quick Check</h3>
      <div className="text-4xl font-bold mb-6">FREE</div>
      <ul className="space-y-3 mb-8">
        <li>✅ 3 prompts tested</li>
        <li>✅ 1 AI model</li>
        <li>✅ Basic visibility score</li>
        <li>❌ No competitor comparison</li>
      </ul>
      <a href="/tools/quick-check" className="btn btn-secondary w-full">
        Try Free
      </a>
    </div>

    {/* PAID TEST */}
    <div className="bg-purple-600 text-white rounded-xl shadow-xl p-8 transform scale-105">
      <div className="bg-yellow-400 text-purple-900 text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
        MOST POPULAR
      </div>
      <h3 className="text-2xl font-bold mb-4">Competitive Test</h3>
      <div className="text-4xl font-bold mb-6">
        €97
        <span className="text-sm font-normal opacity-80">/one-time</span>
      </div>
      <ul className="space-y-3 mb-8">
        <li>✅ 10 strategic prompts</li>
        <li>✅ 2 AI models (GPT-5.1 + Claude)</li>
        <li>✅ Test vs 10 competitors</li>
        <li>✅ Full rankings</li>
        <li>✅ PDF report</li>
      </ul>
      <a href="/tools/competitive-test" className="btn btn-primary w-full">
        Get Report
      </a>
    </div>

    {/* FULL AUDIT */}
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h3 className="text-2xl font-bold mb-4">Full Audit</h3>
      <div className="text-4xl font-bold mb-6">
        €2,400
        <div className="text-sm font-normal text-slate-500">Includes test (save €97)</div>
      </div>
      <ul className="space-y-3 mb-8">
        <li>✅ Everything in Test</li>
        <li>✅ 4 AI platforms tested</li>
        <li>✅ 20+ competitors</li>
        <li>✅ Implementation roadmap</li>
        <li>✅ 1-hour strategy call</li>
      </ul>
      <a href="/contact" className="btn btn-primary w-full">
        Get Audit
      </a>
    </div>
  </div>

  {/* BUNDLES */}
  <div className="mt-16">
    <h3 className="text-2xl font-bold text-center mb-8">Save with Bundles</h3>
    
    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      <div className="border-2 border-purple-500 rounded-xl p-6">
        <h4 className="text-xl font-bold mb-2">Audit + 3 Months Monitoring</h4>
        <div className="text-3xl font-bold text-purple-600 mb-4">
          €4,900
          <span className="text-sm text-slate-500 line-through ml-2">€5,500</span>
        </div>
        <p className="text-slate-600 mb-4">Save €600</p>
        <a href="/contact" className="btn btn-secondary w-full">
          Get Started
        </a>
      </div>

      <div className="border-2 border-blue-500 rounded-xl p-6">
        <h4 className="text-xl font-bold mb-2">Audit + 12 Months Monitoring</h4>
        <div className="text-3xl font-bold text-blue-600 mb-4">
          €15,000
          <span className="text-sm text-slate-500 line-through ml-2">€18,400</span>
        </div>
        <p className="text-slate-600 mb-4">Save €3,400</p>
        <a href="/contact" className="btn btn-primary w-full">
          Get Started
        </a>
      </div>
    </div>
  </div>
</div>
```

---

### File 12: Email Automation Setup

**Path:** `docs/EMAIL-SEQUENCES.md` (NEW FILE - Documentation)

```markdown
# Email Automation Sequences

## Setup with ConvertKit (or Mailchimp)

### Sequence 1: Free Check Follow-Up (5 emails over 10 days)

**Trigger**: User completes free quick check

**Email 1** (Immediate):
- Subject: "Your AI Visibility Score: {score}% (Grade: {grade})"
- Content: Results summary + upgrade CTA
- CTA: "Get Full Competitive Report - €97"

**Email 2** (Day 1):
- Subject: "How does {brand} compare to {competitor}?"
- Content: Tease competitor insights
- CTA: "See your ranking →"

**Email 3** (Day 3):
- Subject: "Case study: How Brand X went from #8 to #2"
- Content: Success story + social proof
- CTA: "Get the same results →"

**Email 4** (Day 7):
- Subject: "Limited offer: €100 off Full Audit"
- Content: Urgency + discount
- CTA: "Claim offer (expires in 3 days) →"

**Email 5** (Day 10):
- Subject: "Last chance: Your discount expires tonight"
- Content: Final FOMO push
- CTA: "Don't miss out →"

---

### Sequence 2: Post-Purchase (Paid Test)

**Trigger**: User completes €97 competitive test

**Email 1** (Immediate):
- Subject: "Your Competitive Report is Ready"
- Content: PDF attached + key insights
- CTA: "View full report →"

**Email 2** (Day 3):
- Subject: "Want help implementing these recommendations?"
- Content: Upsell to Full Audit
- CTA: "Book strategy call →"

**Email 3** (Day 14):
- Subject: "How's your progress on the recommendations?"
- Content: Check-in + offer monitoring
- CTA: "Track progress with monitoring →"

---

## Implementation Steps:

1. **ConvertKit Setup**:
   - Create forms for each sequence
   - Set up automation rules
   - Tag subscribers by product purchased

2. **API Integration**:
   - POST to ConvertKit API when user completes action
   - Include custom fields (score, grade, brand)
   - Tag appropriately

3. **Template Variables**:
   - {brand}
   - {score}
   - {grade}
   - {competitor} (top competitor from test)
```

---

## WEEK 6: TESTING & DEPLOYMENT

### File 13: Testing Checklist

**Path:** `docs/TESTING-CHECKLIST.md` (NEW FILE)

```markdown
# Testing Checklist for Competitive Testing Feature

## Backend Tests

### Free Quick Check Endpoint
- [ ] POST /api/competitive/quick-check with valid data
- [ ] Verify 3 prompts are generated
- [ ] Verify brand mention detection works
- [ ] Verify email is sent
- [ ] Test with non-existent brand
- [ ] Test with empty category
- [ ] Test with invalid email

### Paid Competitive Test
- [ ] POST /api/competitive/full-test with payment
- [ ] Verify 10 competitors discovered
- [ ] Verify 10 prompts generated
- [ ] Verify all 20 tests run (10 × 2 models)
- [ ] Verify rankings are correct
- [ ] Verify PDF is generated
- [ ] Test payment verification
- [ ] Test with invalid payment ID

### Stripe Integration
- [ ] Create payment intent
- [ ] Confirm payment with test card
- [ ] Verify payment in Stripe dashboard
- [ ] Test declined card
- [ ] Test expired card

## Frontend Tests

### Quick Check Page
- [ ] Form validation works
- [ ] Loading state displays
- [ ] Results display correctly
- [ ] Upgrade CTAs are visible
- [ ] Email capture works
- [ ] Mobile responsive

### Competitive Test Page
- [ ] Form validation works
- [ ] Payment flow works
- [ ] Stripe elements load
- [ ] Results display rankings
- [ ] PDF download works
- [ ] Upsell CTAs work

### Pricing Page
- [ ] All prices display correctly
- [ ] Bundles show savings
- [ ] Links work
- [ ] Mobile responsive

## Email Tests

- [ ] Free check result email received
- [ ] Paid test report email received
- [ ] All links in emails work
- [ ] Email formatting looks good
- [ ] Unsubscribe link works

## Integration Tests

- [ ] Full user journey: Free → Paid
- [ ] Payment → Test → Email flow
- [ ] Analytics tracking works
- [ ] Error handling works
- [ ] Rate limiting works (if implemented)

## Performance Tests

- [ ] Free check completes in <60 seconds
- [ ] Paid test completes in <120 seconds
- [ ] No timeout errors
- [ ] API calls are cached where appropriate

## Security Tests

- [ ] Payment verification works
- [ ] No unauthorized access to paid features
- [ ] Email validation prevents spam
- [ ] CORS configured correctly
- [ ] API keys not exposed
```

---

### File 14: Deployment Guide

**Path:** `docs/DEPLOYMENT-COMPETITIVE-FEATURE.md` (NEW FILE)

```markdown
# Deployment Guide for Competitive Testing Feature

## Pre-Deployment Checklist

### Environment Variables

**Backend (.env on Railway)**:
```bash
ANTHROPIC_API_KEY=your-key
OPENAI_API_KEY=your-key
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
FRONTEND_URL=https://yourdomain.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=your-email@gmail.com
```

**Frontend (.env on Vercel)**:
```bash
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

## Deployment Steps

### Step 1: Backend (Railway)

1. **Push to Git**:
```bash
git add .
git commit -m "Add competitive testing feature"
git push origin main
```

2. **Railway Auto-Deploy**:
   - Go to Railway dashboard
   - Verify deployment triggered
   - Check logs for errors
   - Test /health endpoint

3. **Verify Endpoints**:
```bash
curl https://your-backend.railway.app/api/competitive/quick-check -X POST \
  -H "Content-Type: application/json" \
  -d '{"brand":"Test","category":"test","email":"test@test.com"}'
```

### Step 2: Frontend (Vercel)

1. **Deploy**:
```bash
cd frontend
vercel --prod
```

2. **Verify Pages**:
   - Visit https://yourdomain.com/tools/quick-check
   - Visit https://yourdomain.com/tools/competitive-test
   - Visit https://yourdomain.com/pricing

### Step 3: Stripe Setup

1. **Create Products**:
   - Go to Stripe Dashboard
   - Create "Competitive Test" product (€97)
   - Create "Full Audit" product (€2,400)
   - Copy price IDs

2. **Test Mode First**:
   - Use test API keys
   - Test with card: 4242 4242 4242 4242
   - Verify payment completes
   - Check webhook events

3. **Go Live**:
   - Switch to live API keys
   - Test with real card
   - Verify in production

### Step 4: Email Setup

1. **ConvertKit (or Mailchimp)**:
   - Create forms
   - Set up sequences
   - Add API key to backend

2. **Test Emails**:
   - Complete free check
   - Verify email received
   - Check all links work

## Post-Deployment

### Monitoring
- Check Railway Logs for errors
- Monitor Stripe Dashboard for payments
- Track Email Deliverability
- Set up UptimeRobot for uptime monitoring

### Analytics
Add Google Analytics events:
- Quick check started
- Quick check completed
- Payment initiated
- Payment completed
- Report viewed

### Rollback Plan

If something breaks:

1. **Revert Git**:
```bash
git revert HEAD
git push
```
Railway will auto-deploy previous version

2. **Vercel rollback**:
   - Go to Deployments
   - Click "Promote to Production" on previous deploy
```

---

## 🎯 SUMMARY: What Your Friend Needs to Do

Give your friend:
1. This entire plan
2. Access to your Git repo
3. Railway + Vercel logins
4. Stripe account access

**Their tasks**:
1. **Week 1-2**: Implement Files 1-6 (Free Quick Check)
2. **Week 3-4**: Implement Files 7-10 (Paid Test + Stripe)
3. **Week 5**: Implement Files 11-12 (Pricing + Email)
4. **Week 6**: Run Tests (File 13) + Deploy (File 14)

---

## 📊 Expected Results After 6 Weeks

**What you'll have**:
- ✅ FREE quick check tool (3 prompts, 1 model)
- ✅ PAID competitive test (€97, 10 prompts, 2 models, rankings)
- ✅ Stripe payment integration
- ✅ Email automation
- ✅ Updated pricing page with bundles
- ✅ Deployed to production

**What you can start selling**:
- €97 Competitive Tests
- €2,400 Full Audits (existing)
- €15,000 Annual bundles

**First revenue goal**: 3 paid tests = €291 in first week 🎉

---

**Save this entire document and give it to Cursor/Claude Opus to implement!**

