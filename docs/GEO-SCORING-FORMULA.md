# 🎯 GEO Scoring Formula - The Magic System

> **GEO = Generative Engine Optimization**
> 
> This is Dwight's proprietary scoring system for measuring how well content performs in AI-powered search engines like ChatGPT, Bing Chat, Google Gemini, and Perplexity.

---

## Overview

The GEO Score is calculated across **6 dimensions**, each weighted by importance for AI visibility:

| Dimension | Weight | What It Measures |
|-----------|--------|------------------|
| **Structure** | 25% | Content organization & depth |
| **Schema** | 20% | Structured data (JSON-LD) |
| **Citability** | 20% | How quotable is the content |
| **Authority** | 15% | E-E-A-T signals |
| **Freshness** | 10% | Up-to-date signals |
| **Accessibility** | 10% | Technical SEO basics |

**Total: 100 points maximum**

---

## 1. STRUCTURE (25 points)

Content organization is crucial for AI to understand and extract information.

| Factor | Points | Criteria |
|--------|--------|----------|
| **H1 Tag** | 5 | Single H1 = 5pts, Multiple = 2pts, None = 0pts |
| **H2 Subheadings** | 5 | 3+ H2s = 5pts, 1-2 H2s = 3pts, None = 0pts |
| **Heading Hierarchy** | 5 | H1→H2→H3 structure = 5pts |
| **Content Depth** | 5 | 1500+ words = 5pts, 800+ = 4pts, 300+ = 2pts |
| **Internal Links** | 5 | 5+ links = 5pts, 2-4 = 3pts, 0-1 = 1pt |

### Why It Matters
AI engines parse content hierarchically. Well-structured content with clear headings helps AI understand:
- What the main topic is (H1)
- Key subtopics (H2s)
- Supporting details (H3s)

---

## 2. SCHEMA (20 points) ⭐ HIGHEST IMPACT

Structured data is the **#1 factor** for AI visibility. AI engines heavily rely on schema.org markup.

| Factor | Points | Criteria |
|--------|--------|----------|
| **Has Schema** | 5 | Any JSON-LD structured data present |
| **High-Value Types** | 10 | Based on schema type (see below) |
| **FAQPage Bonus** | 5 | Extra points for FAQ schema |

### Schema Type Values

| Schema Type | Points | AI Priority |
|-------------|--------|-------------|
| FAQPage | 10 | 🔥 Highest - AI loves Q&A format |
| HowTo | 8 | High - Step-by-step is citable |
| Article | 6 | Good - News/blog content |
| Product | 6 | Good - E-commerce |
| Review | 5 | Good - Opinion content |
| Recipe | 5 | Good - Instructional |
| Event | 4 | Medium |
| Organization | 4 | Medium - Brand identity |
| Person | 3 | Medium - Author info |
| WebPage | 2 | Basic |
| BreadcrumbList | 2 | Basic |

### Why It Matters
Schema markup is like a "cheat sheet" for AI. It tells AI engines:
- What type of content this is
- Key facts (prices, dates, answers)
- How to cite it properly

**Quick Win:** Adding FAQPage schema alone can boost score by 15-20 points!

---

## 3. CITABILITY (20 points)

How easily can AI quote your content? AI prefers content that's easy to extract.

| Factor | Points | Criteria |
|--------|--------|----------|
| **FAQ Section** | 7 | Has Q&A formatted content |
| **Readability** | 5 | Score 70+ = 5pts, 50+ = 3pts |
| **Sentence Length** | 4 | 10-20 words avg = optimal |
| **Content Structure** | 4 | Clear paragraphs, good flow |

### Optimal Readability
- **Target:** 70+ readability score
- **Sentence length:** 10-20 words average
- **Paragraphs:** 2-3 sentences each
- **Use:** Bullet points, numbered lists

### Why FAQ is King 👑
FAQ sections are the **most citable format** for AI because:
1. Clear question = clear search intent
2. Concise answer = easy to quote
3. Schema support = structured data bonus
4. Matches how users ask AI questions

---

## 4. AUTHORITY (15 points)

E-E-A-T: Experience, Expertise, Authoritativeness, Trustworthiness

| Factor | Points | Criteria |
|--------|--------|----------|
| **Author Info** | 5 | Author name, bio, credentials |
| **External Citations** | 5 | 3+ authoritative references |
| **Organization Signals** | 5 | About page, org schema, contact |

### Building Authority
- Add author bylines with credentials
- Link to authoritative sources (studies, official sites)
- Include Organization schema
- Have clear About and Contact pages

---

## 5. FRESHNESS (10 points)

AI engines prefer up-to-date content.

| Factor | Points | Criteria |
|--------|--------|----------|
| **Publication Date** | 5 | datePublished in schema |
| **Recent Year Mentions** | 3 | Contains current/last year |
| **Last-Modified Header** | 2 | HTTP header present |

### Best Practices
- Always include `datePublished` and `dateModified` in schema
- Update content regularly
- Mention current year where relevant ("Best products in 2025")

---

## 6. ACCESSIBILITY (10 points)

Can AI crawlers access and parse your content?

| Factor | Points | Criteria |
|--------|--------|----------|
| **Meta Description** | 3 | 120-160 chars = optimal |
| **Title Tag** | 2 | 30-60 chars = optimal |
| **Canonical URL** | 2 | Properly set |
| **Image Alt Text** | 3 | 80%+ images have alt |

---

## Grade Scale

| Score | Grade | Interpretation |
|-------|-------|----------------|
| 90-100 | **A+** | Excellent - AI will prioritize this content |
| 80-89 | **A** | Great - Highly likely to be cited |
| 70-79 | **B** | Good - Some optimization needed |
| 60-69 | **C** | Average - Missing key elements |
| 50-59 | **D** | Below average - Needs significant work |
| 0-49 | **F** | Poor - Major issues, unlikely to be cited |

---

## 🚀 Quick Wins (Biggest Impact Actions)

### Tier 1: Massive Impact (+15-25 points)
1. **Add FAQPage schema** with 5+ Q&As
2. **Add comprehensive schema** (Product, Article, HowTo)
3. **Create FAQ section** in content

### Tier 2: High Impact (+5-10 points)
4. **Fix heading structure** (single H1, multiple H2s)
5. **Improve readability** (shorter sentences)
6. **Add author information**

### Tier 3: Quick Fixes (+2-5 points)
7. **Add/fix meta description**
8. **Add image alt text**
9. **Include publication dates**

---

## Competitor Comparison

When comparing against competitors, the system:

1. **Analyzes each competitor** using the same 6 dimensions
2. **Calculates ranking** among all sites
3. **Identifies opportunities** - what competitors do better
4. **Generates insights** - actionable recommendations

### Comparison Metrics
- Score difference (you vs competitor)
- Ranking position (1st, 2nd, etc.)
- Feature comparison (schema, FAQ, etc.)
- Opportunity detection

---

## Technical Implementation

The scoring system is implemented in:
```
backend/app/services/geo_scoring.py
```

Key classes:
- `GEOScorer` - Main scoring engine
- `ScoreBreakdown` - Detailed per-category results
- `GEOScore` - Final result with grade and recommendations

---

## Research Basis

This scoring system is based on:

1. **Google's E-E-A-T Guidelines** - Experience, Expertise, Authority, Trust
2. **Schema.org Priority** - Which schemas AI engines prioritize
3. **AI Citation Patterns** - How ChatGPT, Bing Chat cite sources
4. **SEO Best Practices** - Technical fundamentals
5. **Readability Research** - Optimal content structure for comprehension

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Nov 2024 | Initial formula with 6 dimensions |

---

## Contact

For questions about the scoring methodology:
- Email: support@dwight.app
- Website: https://dwight.app

---

*© 2024 Dwight. Proprietary scoring methodology.*


