# 🔧 Fix Vercel to Deploy from Main Branch

## Quick Steps:

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click on your project: **geo** (or miageru-geo)

2. **Go to Settings**
   - Click **Settings** tab at the top

3. **Change Production Branch**
   - Scroll to **Git** section
   - Find **Production Branch**
   - Change from: `claude/geo-market-analysis-01Xo6GWLoTd3cjGmVjppCfUB`
   - Change to: `main`
   - Click **Save**

4. **Trigger New Deployment**
   - Go back to **Deployments** tab
   - Click **Redeploy** button
   - Select: **Use existing Build Cache: No**
   - Click **Redeploy**

---

## ✅ Done!

From now on:
- Push to `main` branch → Vercel deploys automatically ✅
- No more claude branch confusion ✅
- Clean and simple workflow ✅
