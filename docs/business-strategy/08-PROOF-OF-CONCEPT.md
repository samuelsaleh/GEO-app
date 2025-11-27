# Proof of Concept Plan - Creed

## Overview

This document outlines the validation plan to prove the core hypothesis before scaling.

---

## Core Hypothesis

**Primary Hypothesis:**
> "SMB marketers and publishers will pay €130-€4,300 for services that improve their AI search visibility."

**Sub-Hypotheses:**
1. AI search is growing and impacting traditional search traffic
2. Businesses care enough about AI visibility to act
3. Our recommendations actually improve AI citations
4. The market is willing to pay our prices
5. Customers will refer others (viral potential)

---

## PoC Goals

### Success Criteria (90 Days)

**Minimum Viable Success:**
- ✅ 20 paying customers
- ✅ €10k total revenue
- ✅ 3+ testimonials/case studies
- ✅ 50%+ of customers see improved AI visibility within 8 weeks
- ✅ 10%+ referral rate

**Validation Questions Answered:**
- Do customers care about AI search visibility? (Measured by conversion rate)
- Do our services work? (Measured by before/after AI citations)
- Will they pay? (Measured by close rate at price point)
- Will they stay? (Measured by churn for recurring service)
- Will they refer? (Measured by NPS, actual referrals)

---

## PoC Feature Set

### What to Build (MVP)

**✅ Already Built:**

1. **Landing Page**
   - Clear value proposition
   - Waitlist capture
   - Service descriptions
   - Pricing transparency

2. **Schema Generator (Free Tool)**
   - 5 schema types
   - Copy-paste code
   - Lead magnet

3. **AI Health-Check Tool**
   - 3-step wizard
   - URL + question collection
   - Demo analysis
   - API integration ready

4. **Backend API**
   - Health-check analysis
   - Schema generation
   - Email notifications
   - Content analysis service

**🔧 To Configure:**

1. **Email Integration**
   - Add SMTP credentials
   - Test email delivery
   - Automate confirmations

2. **Payment Processing**
   - Stripe integration
   - Payment links for services
   - Invoice generation

3. **Analytics**
   - Google Analytics
   - Conversion tracking
   - User behavior monitoring

---

## Testing Plan

### Phase 1: Technical Validation (Weeks 1-2)

**Test: Do our recommendations work?**

**Method:**
1. Select 10 test websites (own sites or volunteers)
2. Run baseline AI visibility tests:
   - Query ChatGPT with 10 relevant questions per site
   - Query Bing Chat with same questions
   - Query Perplexity with same questions
   - Document all citations (or lack thereof)
3. Implement our recommendations:
   - Add schema markup
   - Improve FAQ sections
   - Optimize meta descriptions
   - Enhance content structure
4. Wait 2-4 weeks
5. Re-test with same queries
6. Measure improvement in citation rate

**Success Metric:**
- 50%+ of sites show improved citation rate
- At least 5/10 sites get cited where they weren't before

**Timeline:** Complete by end of Week 2

---

### Phase 2: Pricing Validation (Weeks 3-4)

**Test: Will people pay our prices?**

**Method:**
1. Launch waitlist on Product Hunt
2. Offer early access discount (30% off)
3. Email waitlist with pricing options:
   - Health-Check: €1,700
   - Schema Fix-Up: €180 per page type
   - Bundle: €2,000 (both services)
4. Track conversion rates

**Success Metric:**
- 10%+ of waitlist converts to paying customer
- At least 10 customers in first 30 days

**Price Testing:**
- Segment A: €1,700 (standard)
- Segment B: €2,200 (higher)
- Measure close rates, revenue per customer

**Timeline:** Week 3-4

---

### Phase 3: Service Delivery (Weeks 5-8)

**Test: Can we deliver quality at scale?**

**Method:**
1. Deliver first 10 health-checks manually
2. Track time spent per customer
3. Standardize process
4. Build templates and automation
5. Measure customer satisfaction

**Metrics to Track:**
- Time per health-check (target: <10 hours)
- Schema implementation time (target: <3 hours)
- Customer satisfaction score (target: 8/10)
- Issues/questions raised (identify friction)

**Timeline:** Week 5-8

---

### Phase 4: Results Validation (Weeks 9-12)

**Test: Do customers see real results?**

**Method:**
1. Follow up with first 10 customers at Week 8
2. Re-test their AI visibility
3. Compare before/after
4. Document case studies
5. Request testimonials

**Success Metric:**
- 50%+ see measurable improvement
- 3+ willing to provide testimonial
- 1-2 detailed case studies

**Case Study Format:**
- Before: "Not cited in any AI responses"
- After: "Cited in 6/10 ChatGPT queries"
- Timeframe: "Within 6 weeks"
- Services used: "Health-Check + Schema"

**Timeline:** Week 9-12

---

## Customer Acquisition Test

### Channel Testing (First 90 Days)

**Test 5 Acquisition Channels:**

1. **Product Hunt** (Week 3)
   - Goal: 500+ upvotes, 100 waitlist signups
   - Budget: €0
   - Success: Top 5 product of the day

2. **Reddit** (Weeks 1-12, ongoing)
   - Goal: 1,000+ post views, 50 waitlist signups
   - Budget: €0 (organic)
   - Posts: 2 value posts per week in r/SEO, r/marketing

3. **SEO Blog Outreach** (Weeks 4-8)
   - Goal: 2 guest posts published
   - Budget: €500 (maybe payment for placement)
   - Target: Moz, Search Engine Journal

4. **Content Marketing** (Weeks 1-12, ongoing)
   - Goal: 5 blog posts ranking on Google
   - Budget: €1,000 (writer)
   - Topics: "ChatGPT SEO", "AI search optimization"

5. **Paid Ads Test** (Weeks 9-12)
   - Goal: Validate CAC < €500
   - Budget: €1,000
   - Channels: Google Ads, LinkedIn Ads

**Track for Each Channel:**
- Visitors driven
- Waitlist signups
- Paying customers
- Cost per acquisition
- Quality of leads

---

## Data Collection

### Metrics to Track Daily

**Acquisition:**
- Website visitors (by source)
- Waitlist signups
- Demo requests
- Pricing page views

**Activation:**
- Free tool usage
- Email open rates
- Tool engagement time

**Revenue:**
- Sales calls booked
- Proposals sent
- Deals closed
- Revenue (MRR + one-time)

**Retention:**
- Customer satisfaction scores
- Support tickets
- Churn (for recurring service)

**Referral:**
- NPS score
- Actual referrals
- Social media mentions

---

## PoC Budget

### 90-Day Budget: €5,000

| Category | Amount | Purpose |
|----------|--------|---------|
| Tools & Software | €500 | Analytics, email, hosting |
| Content Creation | €1,000 | Blog posts, videos |
| Paid Ads Test | €1,000 | Google/LinkedIn ads |
| Contractors | €1,500 | Development, design help |
| Marketing | €500 | Product Hunt, outreach |
| Misc | €500 | Buffer |

**Revenue Target:** €10,000 (2x budget)
**Profit:** €5,000

---

## Week-by-Week Plan

### Weeks 1-2: Technical Validation
- ✅ Platform already built
- Configure email (SMTP)
- Run baseline AI tests (10 sites)
- Implement recommendations
- Document methodology

### Weeks 3-4: Launch
- Product Hunt launch (Day 1 of Week 3)
- Reddit campaign starts
- Email waitlist with offers
- Close first 5 customers
- Deliver first services

### Weeks 5-8: Delivery & Learning
- Deliver 10-20 health-checks
- Refine process
- Build templates
- Collect feedback
- Iterate on offering

### Weeks 9-12: Validation & Case Studies
- Follow up on results
- Measure AI visibility improvements
- Create 2-3 case studies
- Request testimonials
- Decide: Continue or pivot?

---

## Decision Points

### End of Week 4: Continue or Pivot?

**Green Light (Continue):**
- ✅ 10+ paying customers
- ✅ €5k+ revenue
- ✅ Positive customer feedback
- ✅ Clear demand in market

**Yellow Light (Adjust):**
- ⚠️ 5-9 customers (pivot pricing or positioning)
- ⚠️ €2-5k revenue (improve conversion)
- ⚠️ Mixed feedback (refine offering)

**Red Light (Major Pivot):**
- ❌ <5 customers
- ❌ <€2k revenue
- ❌ Negative feedback
- ❌ No clear interest

---

### End of Week 12: Scale or Stop?

**Scale (Full Launch):**
- ✅ 20+ customers
- ✅ €10k+ revenue
- ✅ 50%+ see results
- ✅ 3+ case studies
- ✅ Profitable unit economics
- ✅ Clear product-market fit

**Pivot:**
- ⚠️ 10-19 customers (need better positioning)
- ⚠️ €5-10k revenue (pricing or volume issue)
- ⚠️ Results inconsistent (refine methodology)

**Stop:**
- ❌ <10 customers (no market)
- ❌ <€5k revenue (won't scale)
- ❌ Services don't work (hypothesis wrong)

---

## Success Stories (Hypothetical)

### Best Case Scenario (90 Days)

**Traction:**
- 30 paying customers
- €15k revenue
- €8k profit
- 5 detailed case studies
- NPS: 60
- 20% referral rate

**Proof:**
- "Brand X saw 300% increase in AI citations in 6 weeks"
- "Publisher Y recovered 15% of lost traffic"
- "Startup Z mentioned in ChatGPT after our optimization"

**Outcome:** Full launch, raise small round or continue bootstrapping

---

### Realistic Scenario (90 Days)

**Traction:**
- 15-20 customers
- €8-12k revenue
- €3-7k profit
- 3 case studies
- NPS: 40-50
- 10% referral rate

**Proof:**
- Clear evidence recommendations work
- Some customers see results, some need more time
- Pricing validated
- Product-market fit emerging

**Outcome:** Continue with adjustments, optimize before scaling

---

### Worst Case Scenario (90 Days)

**Traction:**
- 5-10 customers
- €3-5k revenue
- Break-even or small loss
- 1-2 testimonials
- NPS: 30
- Low referral rate

**Issues:**
- Market not ready yet
- Pricing too high or services not compelling enough
- Results take too long to show

**Outcome:** Major pivot (different pricing, different service, or exit)

---

## PoC Deliverables

### End of 90 Days, We Should Have:

**✅ Platform:**
- Fully functional website
- Working tools (schema generator, health-check)
- Payment processing
- Email automation

**✅ Customers:**
- 15-30 paying customers
- €10-15k revenue
- Real case studies
- Testimonials

**✅ Data:**
- CAC by channel
- Conversion funnel metrics
- Service delivery costs
- Customer satisfaction scores
- AI visibility improvement data

**✅ Content:**
- 10 blog posts
- 3 case studies
- 5+ testimonials
- Product Hunt launch recap

**✅ Decision:**
- Clear go/no-go on full launch
- Validated pricing
- Proven delivery process
- Identified best acquisition channels

---

## Next Steps After PoC

### If Successful (Scale Phase)

**Month 4-6:**
- Hire full-time developer
- Automate 80% of health-check
- Launch SaaS tier
- Scale marketing spend
- Build partnerships

**Month 7-12:**
- Reach €30k MRR
- Hire marketing/sales
- Conference presence
- Media coverage
- Series Seed consideration

### If Needs Pivot

**Potential Pivots:**
1. **B2B Agency Focus:** White-label for agencies only
2. **Vertical Specialization:** E-commerce only or publishers only
3. **Consulting Model:** High-touch agency vs. productized service
4. **Educational Product:** Course/community vs. done-for-you
5. **Different Market:** Enterprise vs. SMB

---

*Last Updated: January 2025*
*Document: 08-PROOF-OF-CONCEPT.md*
