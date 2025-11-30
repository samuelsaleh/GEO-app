# Visibility Check System - Analysis & SMB Recommendations

**Date:** November 30, 2024
**Purpose:** Complete analysis of visibility check implementation + SMB-focused improvement roadmap

---

## 📋 Quick Reference

**Your 4 SMB Priorities:**
1. ✅ **Simplicity** - Plain language, no jargon
2. ✅ **Relevance** - Local business focus (restaurants, stores)
3. ✅ **Action** - Quick wins first, effort estimates
4. ✅ **Strategy** - How to beat competitors

**Implementation Timeline:** 10 days total
- Phase 1 (Critical): 5 days - Plain language + Local focus
- Phase 2 (High): 3 days - Quick wins + Competitive insights
- Phase 3 (Medium): 2 days - Caching for speed

---

## 🎯 System Overview

Your visibility check system tests brand visibility across 6 AI models (Claude, GPT, Gemini) using intelligent prompts. It's similar to Peec AI (€89-499/month) but open-source.

**Core Flow:**
```
User submits brand → Generate 4 smart prompts → Test across AI models
→ Calculate 0-100 score → Show competitors → Give recommendations
```

**Key Innovation:** Web search enabled across all providers for real-time, accurate results.

---

## 🔧 Latest Updates

### **Live Web Search Integration**

You recently added web search to all providers:

- **Claude:** Native `web_search` tool (lines 333-337 in `ai_service.py`)
- **OpenAI:** Responses API + `gpt-4o-search-preview` fallback
- **Gemini:** Google Search tool (new SDK only)

**Impact:**
- ✅ Tests use live web data, not stale training cutoffs
- ✅ Finds real competitors, not hallucinated ones
- ✅ Local businesses get accurate local competitors

---

## 🚀 SMB Priority Improvements

### **Priority 1: Plain Language (3 days) 🔥 CRITICAL**

**Problem:** Technical jargon confuses SMB owners
- "E-E-A-T signals" → What?
- "Add schema markup" → How?
- "Mention rate 40%" → Is that good?

**Solution:** Rewrite all recommendations in plain English

**Example Changes:**
```diff
- "Your mention rate is 40% with negative sentiment"
+ "AI tools mention you 4 out of 10 times, but the tone is often negative"

- "Improve your E-E-A-T signals"
+ "Build trust by adding customer reviews and credentials to your site"

- "Add schema markup"
+ "Add special code that helps AI understand your business (we can help)"
```

**Files to modify:**
- `backend/app/services/visibility_monitor.py` (lines 576-632)
  - Rewrite all recommendation strings
  - Add "Why this matters" + "How to do it"

- `backend/app/models/speed_test.py`
  - Change `recommendations: List[str]` to `recommendations: List[ActionableRecommendation]`
  - Add fields: `issue`, `why`, `fix`, `impact`, `effort`, `priority`

---

### **Priority 2: Local Business Focus (2 days) 🔥 CRITICAL**

**Problem:** 60% of SMBs are local (restaurants, stores), but prompts are generic
- "Best restaurants" → Returns McDonald's, not local options
- Missing city/region in tests

**Solution:** Location-aware prompts for local businesses

**Example Changes:**
```python
# CURRENT (generic):
"What are the best Italian restaurants?"

# IMPROVED (local):
"What are the best Italian restaurants in Antwerp?"
"Where should I eat Italian food in Antwerp tonight?"
"Italian restaurants near Antwerp city center"
```

**Files to modify:**
- `backend/app/services/speed_test.py`
  - `_generate_prompts()`: Detect location, inject into ALL prompts
  - Test "in [city]" and "near [city]" variants

- `backend/app/services/brand_analyzer.py` (lines 375-407)
  - Already detects `is_local_business` ✅
  - Add location to ALL prompts when local
  - Use local framing: "Compare with other pizza places in Antwerp"

- `backend/app/services/visibility_monitor.py` (lines 703-739)
  - Add "restaurant" template with local variants
  - Add "retail_store" template
  - Add "service_provider" template

---

### **Priority 3: Quick Wins First (1 day) 🟠 HIGH**

**Problem:** Recommendations are overwhelming, no prioritization
- 10 recommendations shown at once
- No guidance on where to start
- SMBs get paralyzed → do nothing

**Solution:** Show 3 "5-minute fixes" first

**Example:**
```python
quick_wins = [
    {
        "title": "Claim your Google Business Profile",
        "why": "AI tools pull from Google first",
        "time": "5 minutes",
        "impact": "🔥 HIGH",
        "how": "Visit google.com/business and claim your listing"
    },
    {
        "title": "Write a detailed About page",
        "why": "AI needs context about your business",
        "time": "30 minutes",
        "impact": "🔥 HIGH",
        "how": "Include: your story, what makes you unique, reviews"
    }
]
```

**Files to modify:**
- `backend/app/services/speed_test.py`
  - Add `quick_wins` section to ScoreResponse
  - Filter for actions < 1 hour with HIGH impact
  - Sort by impact/effort ratio

- `frontend/src/app/tools/ai-visibility/page.tsx`
  - Show top 3 quick wins prominently
  - Collapse medium/long-term into "See more" button

---

### **Priority 4: Competitive Insights (2 days) 🟠 HIGH**

**Problem:** Shows competitor names but no strategy
- "Cartier mentioned 50%" → So what?
- No guidance on how to compete

**Solution:** Show WHY competitors win + HOW to beat them

**Example:**
```python
competitive_insights = {
    "dominant_competitor": {
        "name": "Cartier",
        "why_winning": "Mentioned first in 80% of responses",
        "what_they_do": "Strong brand recognition + luxury positioning",
        "how_to_compete": "Position as 'affordable luxury alternative to Cartier'"
    },
    "opportunity_gap": {
        "finding": "No competitors mention 'sustainable jewelry'",
        "action": "Claim the 'sustainable luxury jewelry' niche",
        "potential": "Could become go-to for eco-conscious buyers"
    }
}
```

**Files to modify:**
- `backend/app/services/speed_test.py`
  - `_extract_competitors()`: Analyze WHY each is mentioned
  - Identify keywords no competitor owns (gap analysis)
  - Generate differentiation strategies

- `frontend/src/app/tools/ai-visibility/page.tsx`
  - Add "Pick competitor to beat" dropdown
  - Show targeted action plan for that competitor

---

## ⚡ Optional: Caching for Speed (2 days) 🟡 MEDIUM

**Problem:** Same brand tested multiple times = slow (10-15 seconds)

**Solution:** Cache results for 24 hours

**Benefit:**
- 80% faster for repeat queries (3 sec vs 15 sec)
- Better UX for testing variations
- Less API rate limiting

**Note:** Since you have Claude/Gemini subscriptions, this is for **speed**, not cost.

**Files to modify:**
- Create `backend/app/services/cache_service.py`
- Modify `backend/app/services/speed_test.py`
  - Add cache check before AI calls
  - Hash key: `brand + category + location + prompt`
  - Add "Force refresh" button in UI

---

## 📊 Implementation Roadmap

| Phase | Priority | Tasks | Days | Benefit |
|-------|----------|-------|------|---------|
| **1** | 🔥 Critical | Plain language + Local focus | 5 | SMBs understand & get relevant results |
| **2** | 🟠 High | Quick wins + Competitive insights | 3 | SMBs take action with clear strategy |
| **3** | 🟡 Medium | Caching for speed | 2 | Faster repeat queries |
| **Total** | | | **10** | SMB-ready MVP |

---

## 🔑 Key Files to Modify

**Backend (Python):**
1. `backend/app/services/speed_test.py` - Quick wins, caching, scoring
2. `backend/app/services/visibility_monitor.py` - Local prompts, plain language
3. `backend/app/models/speed_test.py` - ActionableRecommendation model
4. `backend/app/services/brand_analyzer.py` - Local competitor detection

**Frontend (TypeScript):**
5. `frontend/src/app/tools/ai-visibility/page.tsx` - Quick wins UI, competitor picker

**New Files:**
6. `backend/app/services/cache_service.py` - Caching layer (optional)

---

## ✅ Current Strengths (Keep These!)

1. **Multi-Provider Resilience** - Claude, GPT, Gemini with fallback
2. **Web Search Enabled** - Real-time, accurate results
3. **6-Category Framework** - Tests organic + competitive visibility
4. **Local Business Detection** - Already identifies local businesses
5. **0-100 Scoring** - Easy to understand

**Since you have subscriptions:**
- ✅ Keep web search enabled everywhere (accuracy > cost)
- ✅ Use best models (Claude Sonnet 4, Gemini 3 Pro)
- ❌ Skip tiered pricing (not needed)

---

## 📁 System Architecture

```
Frontend (Next.js)
    ↓
API Layer (FastAPI)
    ↓
Service Layer:
- Speed Test Service (0-100 scoring)
- Visibility Monitor (prompt testing)
- Brand Analyzer (website analysis)
- AI Service (multi-provider)
    ↓
AI Providers:
- Claude Sonnet 4 (web search ✅)
- GPT-5.1 (web search ✅)
- Gemini 3 Pro (web search ✅)
```

---

## 🎬 How to Continue Tomorrow

**Option 1: Start with Priority 1 (Plain Language)**
```
"Let's implement Priority 1: Plain Language.
Start with rewriting recommendations in visibility_monitor.py"
```

**Option 2: Start with Priority 2 (Local Focus)**
```
"Let's implement Priority 2: Local Business Focus.
Start with location-aware prompts in speed_test.py"
```

**Option 3: Overview first**
```
"Show me the plan for implementing all 4 SMB priorities"
```

---

## 📞 Contact Points

**Analysis Created:** November 30, 2024
**Original Plan File:** `/Users/samuelsaleh/.claude/plans/scalable-juggling-hejlsberg.md`
**This Summary:** `/Users/samuelsaleh/Desktop/GEO-app/docs/VISIBILITY-ANALYSIS-SMB-RECOMMENDATIONS.md`

---

## 🔍 Full Technical Details

For complete technical analysis including:
- Line-by-line code breakdown
- All 10 identified limitations
- Technical debt prioritization
- Complete execution flow examples

See the full plan file at: `/Users/samuelsaleh/.claude/plans/scalable-juggling-hejlsberg.md` (1134 lines)
