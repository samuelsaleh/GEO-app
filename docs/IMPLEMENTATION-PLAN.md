# 🛠️ Implementation Plan: Freemium AI Visibility Tool

> Based on 6-Week Build Plan + Current Visibility Tool

---

## ✅ COMPLETED

### Frontend - AI Visibility Tool Enhanced
- [x] 5 fixed scoring categories (Recommendation, Best Of, Comparison, Problem/Solution, Alternative)
- [x] 2 optional custom prompt slots
- [x] Limited to 2 AI models for free tier (GPT-4o + Claude)
- [x] Email capture field
- [x] Results page with analysis & interpretation
- [x] Category breakdown with insights
- [x] Strengths & weaknesses section
- [x] Recommendations based on weak categories
- [x] Upgrade CTA for €97 full report
- [x] Grade system (A-F) with interpretation

---

## 🔄 IN PROGRESS

### Backend Adjustments Needed
- [ ] Update `/api/visibility/test-multi-model` to accept `models` parameter (to limit to 2 models)
- [ ] Add email service integration for sending free report
- [ ] Create `/api/visibility/send-report` endpoint

---

## 📋 TODO (Priority Order)

### Phase 1: Backend - Free Tier Support (Today)
1. **Update visibility endpoint** - Accept models array to limit testing
2. **Add email sending** - Send results to user email
3. **Store results** - Save test results to database for later retrieval

### Phase 2: Paid Tier - €97 Report (This Week)
1. **Create Stripe service** - `backend/app/services/stripe_service.py`
2. **Add payment endpoint** - `/api/payments/create-intent`
3. **Add full test endpoint** - `/api/visibility/full-test` (all 6 models + competitors)
4. **Generate PDF report** - Use reportlab or weasyprint

### Phase 3: Frontend - Payment Flow
1. **Add Stripe Elements** - Payment form component
2. **Create upgrade flow** - From free results → payment → full results
3. **Full results page** - 6 models + competitor rankings + PDF download

### Phase 4: Email Automation
1. **Free check email** - Results + upgrade CTA
2. **Post-purchase email** - Full report PDF attached
3. **Follow-up sequence** - 3-email nurture for free users

---

## 📁 Files to Create/Modify

### Backend
```
backend/app/
├── api/
│   ├── visibility.py          # MODIFY - add models parameter
│   └── payments.py             # NEW - Stripe endpoints
├── services/
│   ├── stripe_service.py       # NEW - Stripe integration
│   ├── pdf_generator.py        # NEW - Generate PDF reports
│   └── email_service.py        # MODIFY - add report emails
└── models/
    └── visibility_results.py   # NEW - Store test results
```

### Frontend
```
frontend/src/
├── app/
│   └── tools/
│       └── ai-visibility/
│           ├── page.tsx        # DONE - Free tier flow
│           └── full-report/
│               └── page.tsx    # NEW - Paid tier results
├── components/
│   └── StripePayment.tsx       # NEW - Payment component
└── lib/
    └── stripe.ts               # NEW - Stripe client setup
```

---

## 🎯 Current Session Goals

While user is away, implement:

1. ✅ Frontend visibility tool with 5 categories
2. 🔄 Backend - Update test-multi-model to accept models param
3. 🔄 Backend - Add send-report endpoint
4. 📋 Backend - Create basic Stripe service
5. 📋 Frontend - Wire up "Email Me This Report" button

---

## 💰 Business Model Summary

| Tier | Price | Features |
|------|-------|----------|
| **Free** | €0 | 5 categories, 2 models, basic analysis, email capture |
| **Full Report** | €97 | 5 categories + custom, 6 models, competitor ranking, PDF |
| **Full Audit** | €2,400 | Everything + strategy call + implementation plan |

---

## 🧪 Testing Checklist

### Free Tier
- [ ] Brand analysis works
- [ ] Profile review works  
- [ ] 5 category prompts generated correctly
- [ ] Tests run on exactly 2 models (GPT-4o + Claude)
- [ ] Results show analysis & interpretation
- [ ] Email capture saves email
- [ ] "Email Me Report" sends email

### Paid Tier
- [ ] Payment flow works (test card)
- [ ] All 6 models tested after payment
- [ ] Competitor ranking displayed
- [ ] PDF generated and downloadable
- [ ] Email sent with PDF attached

---

## 📝 Notes

- Building on existing `/tools/ai-visibility` instead of creating separate `/tools/quick-check`
- Keep the wizard flow (Brand Info → Review Profile → Select Prompts → Results)
- Free tier is lead magnet for €97 upgrade
- €97 is stepping stone to €2,400 audit

