# 📈 GEO Performance & ROI Tracking

## Overview

This document outlines how to measure the return on investment (ROI) for GEO (Generative Engine Optimization) efforts using Dwight.

---

## 🎯 Key Performance Indicators (KPIs)

### Tier 1: Direct Visibility Metrics

| KPI | Description | Target | Measurement |
|-----|-------------|--------|-------------|
| **GEO Score** | Overall AI optimization score | 70+ (Grade B) | Dwight Health Check |
| **AI Mention Rate** | % of prompts where brand appears | 30%+ | Weekly prompt testing |
| **Position Rank** | Average position in AI recommendations | Top 3 | Prompt monitoring |
| **Competitor Gap** | Score difference vs competitors | +10 points | Competitor analysis |

### Tier 2: Traffic Metrics

| KPI | Description | How to Track |
|-----|-------------|--------------|
| **AI Referral Traffic** | Visits from AI platforms | Google Analytics referrals |
| **AI-Attributed Sessions** | Sessions from AI sources | UTM parameters |
| **Page Views from AI** | Which pages AI sends traffic to | Landing page reports |

### Tier 3: Business Impact

| KPI | Description | Calculation |
|-----|-------------|-------------|
| **AI-Attributed Leads** | Leads from AI traffic | Form submissions × AI referral % |
| **AI-Attributed Revenue** | Revenue from AI-referred customers | Sales × AI attribution |
| **Cost per AI Lead** | Efficiency of GEO efforts | GEO investment ÷ AI leads |

---

## 📊 Tracking Setup

### 1. Google Analytics 4 Setup

Create a custom segment for AI traffic:

```
Referral sources containing:
- chat.openai.com
- bing.com/chat  
- copilot.microsoft.com
- perplexity.ai
- bard.google.com
- gemini.google.com
- claude.ai
```

### 2. UTM Parameters for AI Tracking

When you're cited in AI with a link, the URL might include:
```
?utm_source=chatgpt&utm_medium=ai&utm_campaign=geo
```

### 3. Server-Side Tracking

Check HTTP referrer headers for AI platforms:
```javascript
const aiSources = [
  'chat.openai.com',
  'perplexity.ai',
  'bing.com',
  'gemini.google.com'
];

const isAIReferral = aiSources.some(source => 
  document.referrer.includes(source)
);
```

---

## 💰 ROI Calculation Formula

### Simple ROI

```
ROI = (Revenue from AI - GEO Investment) / GEO Investment × 100%
```

### Example Calculation

| Metric | Value |
|--------|-------|
| Monthly AI referral visits | 500 |
| Conversion rate | 2% |
| AI-attributed leads | 10 |
| Average deal value | €500 |
| Monthly AI revenue | €5,000 |
| Monthly GEO investment | €500 |
| **Monthly ROI** | **900%** |

---

## 📅 Reporting Cadence

### Weekly Report
- GEO score changes
- New AI mentions detected
- Traffic from AI sources
- Quick wins implemented

### Monthly Report
- Score progression chart
- Competitor ranking changes
- AI traffic trends
- Lead attribution
- ROI calculation

### Quarterly Report
- Strategic review
- Competitor landscape changes
- AI platform updates
- ROI trend analysis
- Next quarter priorities

---

## 🔍 AI Visibility Monitoring

### Manual Prompt Testing

Test your brand visibility weekly with prompts like:

```
Industry-specific:
- "Best [your product category] in [location]"
- "Top [your service] companies"
- "Recommended [your niche] brands"

Comparison prompts:
- "[Your brand] vs [Competitor]"
- "Is [Your brand] good for [use case]?"

Purchase intent:
- "Where to buy [your product]"
- "Best [product] under €X"
```

### Automated Monitoring

Track responses from:
- ChatGPT (GPT-4, GPT-4o)
- Bing Copilot
- Google Gemini
- Perplexity
- Claude

Record:
1. Were you mentioned? (Yes/No)
2. Position (1st, 2nd, 3rd, not listed)
3. Sentiment (Positive/Neutral/Negative)
4. Was your site cited as source?

---

## 📈 Benchmark Data

### Industry Averages (2024-2025)

| Metric | Poor | Average | Good | Excellent |
|--------|------|---------|------|-----------|
| GEO Score | <40 | 40-60 | 60-80 | 80+ |
| AI Mention Rate | <10% | 10-25% | 25-50% | 50%+ |
| AI Traffic Share | <1% | 1-5% | 5-15% | 15%+ |
| Position Rank | >10 | 5-10 | 2-5 | Top 2 |

### Expected Timeline

| Phase | Duration | Expected Improvement |
|-------|----------|---------------------|
| Quick Wins | 2-4 weeks | +15-25 GEO points |
| Optimization | 1-3 months | +20-30 GEO points |
| Authority Building | 3-6 months | Consistent top 3 ranking |
| Market Leadership | 6-12 months | #1 in AI recommendations |

---

## 🛠️ Tools Stack

### Free Tools
- **Google Analytics 4** - Traffic tracking
- **Google Search Console** - Search visibility
- **Dwight Health Check** - GEO scoring

### Paid Tools
- **Peec AI** - AI visibility monitoring (€89-499/mo)
- **Semrush** - SEO + AI tracking
- **Ahrefs** - Backlink monitoring

### DIY Monitoring
- Weekly manual prompt testing
- Spreadsheet tracking
- Custom scripts for automation

---

## 📋 Monthly Tracking Template

```markdown
## GEO Monthly Report - [Month Year]

### Score Progress
- Starting Score: __
- Ending Score: __
- Change: +/- __

### Competitor Ranking
1. [Competitor 1]: Score __
2. [Your Brand]: Score __
3. [Competitor 2]: Score __

### AI Traffic
- Total AI referrals: __
- Top AI source: __
- Conversion rate: __%

### Actions Completed
- [ ] Schema markup added
- [ ] FAQ section created
- [ ] Meta descriptions optimized
- [ ] Content updated

### ROI Calculation
- Investment: €__
- Revenue attributed: €__
- ROI: __%

### Next Month Priorities
1. 
2. 
3. 
```

---

## 🎯 Success Criteria

### Short-term (1-3 months)
- GEO Score reaches 70+ (Grade B)
- Appear in 30%+ of relevant AI prompts
- Outrank 2+ competitors

### Medium-term (3-6 months)
- GEO Score reaches 80+ (Grade A)
- AI traffic reaches 5% of total traffic
- Top 3 position in key prompts

### Long-term (6-12 months)
- GEO Score reaches 90+ (Grade A+)
- AI traffic reaches 15%+ of total
- #1 recommendation in category

---

## 📚 Resources

- [Peec AI](https://peec.ai) - AI visibility monitoring platform
- [Schema.org](https://schema.org) - Structured data documentation
- [Google's E-E-A-T Guidelines](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)

---

*Document Version: 1.0*
*Last Updated: November 2024*

