# 🚀 Deployment Guide - Dwight

This guide explains how to deploy your Dwight platform to production.

---

## 📋 Table of Contents

1. [Frontend Deployment (Vercel)](#frontend-deployment)
2. [Backend Deployment (Railway/Render)](#backend-deployment)
3. [Environment Variables](#environment-variables)
4. [Database Setup](#database-setup)
5. [Custom Domain](#custom-domain)
6. [Monitoring](#monitoring)

---

## 🌐 Frontend Deployment (Vercel)

Vercel is perfect for Next.js apps - free tier available!

### Step 1: Push to GitHub

Your code is already in Git. Make sure it's pushed:

```bash
git push origin claude/geo-market-analysis-01Xo6GWLoTd3cjGmVjppCfUB
```

### Step 2: Deploy to Vercel

**Option A: Via Vercel Dashboard**
1. Go to https://vercel.com
2. Sign up/login with GitHub
3. Click "New Project"
4. Import your `GEO-app` repository
5. Root directory: `frontend`
6. Framework preset: **Next.js** (auto-detected)
7. Click "Deploy"

**Option B: Via CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name? creed
# - Which directory is your code? ./
# - Want to override settings? No
```

### Step 3: Set Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

### Step 4: Redeploy

After adding env vars, trigger a new deployment.

**Your frontend is live!** 🎉

---

## 🔧 Backend Deployment (Railway)

Railway offers free tier with $5 credit/month.

### Step 1: Create Railway Account

1. Go to https://railway.app
2. Sign up with GitHub

### Step 2: Deploy Backend

1. Click "New Project"
2. Choose "Deploy from GitHub repo"
3. Select your `GEO-app` repository
4. Railway will detect Python automatically

### Step 3: Configure Build

In Railway Dashboard:

**Settings:**
- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

**Environment Variables:**
```
# API Keys
OPENAI_API_KEY=sk-...your-key...
ANTHROPIC_API_KEY=your-key

# Email (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=your-email@gmail.com

# Security
SECRET_KEY=generate-a-random-secret-key-here

# Environment
ENVIRONMENT=production
```

### Step 4: Get Your API URL

Railway will give you a URL like:
```
https://your-app.up.railway.app
```

Use this as `NEXT_PUBLIC_API_URL` in Vercel!

**Your backend is live!** 🎉

---

## Alternative: Render

Render also has a free tier.

### Deploy to Render:

1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repo
4. Settings:
   - Name: `creed-api`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Root Directory: `backend`

5. Add environment variables (same as above)

6. Deploy!

---

## 🔐 Environment Variables Reference

### Frontend (.env.local)

```bash
# API URL (production)
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

### Backend (.env)

```bash
# Required
OPENAI_API_KEY=sk-...          # For AI analysis (get from OpenAI)
ANTHROPIC_API_KEY=...          # For Claude integration (get from Anthropic)

# Email (Gmail Setup)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password  # Generate in Gmail → Security → App Passwords
FROM_EMAIL=your-email@gmail.com

# Security
SECRET_KEY=your-super-secret-key-here  # Generate: openssl rand -hex 32

# Optional
DATABASE_URL=postgresql://...   # If using PostgreSQL
ENVIRONMENT=production
```

### How to Get Gmail App Password:

1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to App Passwords
4. Generate new app password
5. Use that password (not your regular Gmail password)

---

## 💾 Database Setup (Optional)

Currently, data is stored in JSON files. For production, use PostgreSQL:

### Railway PostgreSQL:

1. In Railway dashboard, click "New"
2. Select "Database" → "PostgreSQL"
3. Copy the `DATABASE_URL`
4. Add it to your backend environment variables

### Update Backend:

You'll need to add database models and migrations (SQLAlchemy/Alembic).
The basic structure is already in place (`backend/app/models/`).

---

## 🌍 Custom Domain

### Vercel (Frontend):

1. Go to Project Settings → Domains
2. Add your domain: `www.creed.app`
3. Follow DNS instructions (add CNAME record)

### Railway (Backend):

1. Project Settings → Networking
2. Generate Domain or add custom domain
3. Point your DNS to Railway

---

## 📊 Monitoring

### Vercel Analytics:

- Automatically enabled
- View in Dashboard → Analytics

### Railway Logs:

- View real-time logs in Dashboard
- Set up alerts for errors

### Error Tracking (Optional):

Add Sentry:

```bash
# Frontend
npm install @sentry/nextjs

# Backend
pip install sentry-sdk
```

Configure in `next.config.js` and `app/main.py`

---

## 🔒 Security Checklist

Before going live:

- [ ] Change all default API keys
- [ ] Generate strong SECRET_KEY
- [ ] Enable HTTPS (automatic on Vercel/Railway)
- [ ] Set up CORS properly (already configured)
- [ ] Use Gmail App Password (not regular password)
- [ ] Don't commit .env files
- [ ] Add rate limiting (optional)
- [ ] Set up backup strategy

---

## 🧪 Testing Deployment

### Frontend:
```
https://your-domain.vercel.app
```

Try:
- Landing page loads
- Schema Generator works
- Health Check works
- Waitlist signup works

### Backend:
```
https://your-backend.railway.app/docs
```

Try:
- API docs load
- Health endpoint responds
- Test an endpoint

---

## 🆘 Troubleshooting

### Frontend not connecting to Backend:

- Check `NEXT_PUBLIC_API_URL` is set correctly
- Verify backend is running
- Check browser console for errors
- Ensure CORS is configured (already done)

### Backend errors:

- Check Railway/Render logs
- Verify all environment variables are set
- Test locally first: `uvicorn app.main:app --reload`

### Email not sending:

- Verify Gmail App Password
- Check SMTP settings
- Test with a simple script first

---

## 📈 Scaling

### When traffic grows:

**Vercel:**
- Pro plan: $20/month (unlimited bandwidth)
- Auto-scales automatically

**Railway:**
- Upgrade plan as needed
- Add Redis for caching
- Add PostgreSQL for data

**Performance:**
- Enable CDN (automatic on Vercel)
- Add caching layer
- Optimize images
- Use database connection pooling

---

## 💡 Quick Deploy Commands

```bash
# Frontend
cd frontend
vercel --prod

# Backend (if using Heroku)
cd backend
git push heroku main

# Check logs
vercel logs
railway logs
```

---

## ✅ Post-Deployment

After successful deployment:

1. **Test everything** - Click through all pages
2. **Monitor for 24 hours** - Watch for errors
3. **Set up uptime monitoring** - Use UptimeRobot (free)
4. **Configure backups** - For database
5. **Update DNS** - Point your domain
6. **Share with users!** - You're live! 🎉

---

## 🎯 Quick Links

- **Vercel Docs:** https://vercel.com/docs
- **Railway Docs:** https://docs.railway.app
- **Render Docs:** https://render.com/docs
- **Next.js Deploy:** https://nextjs.org/docs/deployment

---

Need help? Check the troubleshooting section or create an issue in the repo!
