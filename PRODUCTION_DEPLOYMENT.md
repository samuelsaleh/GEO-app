# 🚀 Production Deployment Guide - Authentication System

This guide walks you through deploying your authentication system to production with Railway (backend + PostgreSQL) and Vercel (frontend).

---

## 📋 Prerequisites

Before starting, make sure you have:

- [ ] Railway account ([sign up](https://railway.app))
- [ ] Vercel account ([sign up](https://vercel.com))
- [ ] OpenAI API key
- [ ] Anthropic API key
- [ ] Google API key
- [ ] Git repository pushed to GitHub

---

## 🎯 Deployment Overview

```
┌─────────────────┐
│  Vercel         │
│  (Frontend)     │
│  Next.js App    │
└────────┬────────┘
         │ HTTPS
         │ API Calls
         ▼
┌─────────────────┐      ┌──────────────┐
│  Railway        │──────│  PostgreSQL  │
│  (Backend)      │      │  Database    │
│  FastAPI + Auth │      └──────────────┘
└─────────────────┘
```

---

## 🔧 Part 1: Deploy Backend to Railway

### Step 1: Install Railway CLI

```bash
# macOS
brew install railway

# or via npm
npm install -g @railway/cli

# Verify installation
railway --version
```

### Step 2: Login to Railway

```bash
railway login
```

This will open your browser to authenticate.

### Step 3: Create Railway Project

```bash
cd backend
railway init

# Select "Create new project"
# Give it a name: "geo-app-backend"
```

### Step 4: Add PostgreSQL Database

```bash
railway add

# Select: PostgreSQL
```

Railway will automatically:
- Provision a PostgreSQL instance
- Set the `DATABASE_URL` environment variable
- Link it to your project

### Step 5: Set Environment Variables

Generate a secure secret key:

```bash
python3 -c 'import secrets; print(secrets.token_urlsafe(32))'
```

Set variables in Railway:

```bash
# Via CLI (recommended for sensitive data)
railway variables --set "SECRET_KEY=your-generated-key-here"
railway variables --set "DEBUG=false"

# Or via Railway Dashboard (easier for API keys)
railway open
# → Variables → Add variables
```

**Required variables:**

```bash
# Security
SECRET_KEY=<generated-key-from-above>
DEBUG=false
ALGORITHM=HS256

# Database (automatically set by Railway)
DATABASE_URL=postgresql://...

# AI API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...

# Frontend URL (you'll update this after Vercel deployment)
FRONTEND_URL=https://your-app.vercel.app

# Email (optional, for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=your-email@gmail.com
```

### Step 6: Deploy Backend

```bash
railway up
```

This will:
- Build your Python app
- Install dependencies from `requirements.txt`
- Start the server with the command from `railway.toml`
- Run database migrations

### Step 7: Get Your Backend URL

```bash
railway domain
```

This will generate a public URL like:
```
https://geo-app-backend-production.up.railway.app
```

**Save this URL!** You'll need it for the frontend.

### Step 8: Verify Backend Deployment

Visit your backend URL in a browser:
```
https://your-backend.railway.app/docs
```

You should see the FastAPI Swagger documentation.

Test the health endpoint:
```
https://your-backend.railway.app/
```

---

## 🌐 Part 2: Deploy Frontend to Vercel

### Step 1: Install Vercel CLI

```bash
npm install -g vercel

# Verify installation
vercel --version
```

### Step 2: Deploy Frontend

```bash
cd frontend
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? [Your account]
# - Link to existing project? No
# - What's your project's name? geo-app
# - In which directory is your code located? ./
# - Want to override settings? No
```

For production deployment:

```bash
vercel --prod
```

### Step 3: Set Environment Variables in Vercel

**Option A: Via Dashboard (Recommended)**

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   ```
   NEXT_PUBLIC_API_URL = https://your-backend.railway.app
   ```
5. Click **Save**

**Option B: Via CLI**

```bash
vercel env add NEXT_PUBLIC_API_URL
# When prompted, paste: https://your-backend.railway.app
# Select: Production
```

### Step 4: Redeploy with Environment Variables

```bash
vercel --prod
```

### Step 5: Get Your Frontend URL

After deployment, Vercel will give you URLs like:
```
✅ Production: https://geo-app.vercel.app
```

---

## 🔗 Part 3: Connect Frontend and Backend

### Step 1: Update Backend CORS

Now that you have your Vercel frontend URL, update the Railway backend:

```bash
cd backend
railway variables --set "FRONTEND_URL=https://your-app.vercel.app"

# Also update the production_url
railway variables --set "PRODUCTION_URL=https://your-app.vercel.app"
```

Or via Railway Dashboard:
1. Open Railway dashboard
2. Select your backend project
3. Go to **Variables**
4. Update `FRONTEND_URL` with your Vercel URL

Railway will automatically redeploy with the new variables.

### Step 2: Verify CORS Configuration

The backend `app/main.py` already has CORS configured. It will now accept requests from your Vercel frontend.

---

## ✅ Part 4: Test Authentication System

### Test Registration

1. Go to your Vercel frontend: `https://your-app.vercel.app/signup`
2. Create a test account:
   - Email: test@example.com
   - Password: TestPassword123
3. Submit the form

**Expected result:**
- User created successfully
- Redirected to dashboard or home page

### Test Login

1. Go to: `https://your-app.vercel.app/login`
2. Login with your test credentials
3. Submit

**Expected result:**
- Successfully logged in
- JWT token stored in localStorage
- Redirected to dashboard

### Test Protected Routes

1. While logged in, try accessing protected routes
2. Try accessing them after clearing localStorage (should redirect to login)

### Verify Database

Check that users are being created in PostgreSQL:

```bash
cd backend
railway run psql $DATABASE_URL

# Inside PostgreSQL:
SELECT * FROM users;
\q
```

---

## 🐛 Troubleshooting

### Backend Issues

**Problem:** Railway deployment fails

**Solution:**
```bash
# Check logs
railway logs

# Common issues:
# - Missing environment variables
# - Database connection failed
# - Python version mismatch
```

**Problem:** Database tables not created

**Solution:**
```bash
# Tables are auto-created on startup via init_db()
# If issues persist, manually create them:
railway run python -c "from app.database import init_db; init_db()"
```

**Problem:** CORS errors

**Solution:**
- Verify `FRONTEND_URL` is set correctly in Railway
- Check `app/main.py` has your Vercel URL in `allowed_origins`
- Make sure there's no trailing slash in URLs

### Frontend Issues

**Problem:** API calls return 404 or CORS errors

**Solution:**
```bash
# Verify environment variable is set
vercel env ls

# Check the value
vercel env pull .env.local

# Verify API_URL in browser console:
# Should be: https://your-backend.railway.app (no trailing slash)
```

**Problem:** Authentication doesn't work

**Solution:**
- Check browser console for errors
- Verify backend `/docs` endpoint works
- Test API directly: `curl https://your-backend.railway.app/api/auth/register`

### Database Issues

**Problem:** Can't connect to PostgreSQL

**Solution:**
```bash
# Verify DATABASE_URL is set
railway variables

# Test connection
railway run python -c "from app.database import engine; print(engine.url)"
```

---

## 🔒 Security Checklist

Before going live:

- [ ] Changed `SECRET_KEY` from default
- [ ] Set `DEBUG=false` in production
- [ ] Using PostgreSQL (not SQLite)
- [ ] All API keys are set as environment variables
- [ ] CORS is configured with specific origins (not `*`)
- [ ] HTTPS is enabled (automatic on Railway/Vercel)
- [ ] Database credentials are secure
- [ ] `.env` files are not committed to Git

---

## 📊 Monitoring

### Backend Monitoring (Railway)

```bash
# View real-time logs
railway logs

# View metrics
railway open  # Opens dashboard with CPU/Memory/Network stats
```

### Frontend Monitoring (Vercel)

1. Go to Vercel Dashboard
2. Select your project
3. View:
   - **Analytics**: Traffic, page views
   - **Logs**: Server-side logs
   - **Deployments**: Build history

---

## 🎯 Quick Commands Reference

### Railway (Backend)

```bash
railway login              # Login to Railway
railway init              # Create new project
railway add               # Add PostgreSQL
railway variables         # View/set environment variables
railway up                # Deploy
railway logs              # View logs
railway domain            # Get public URL
railway open              # Open dashboard
railway run <command>     # Run command in Railway environment
```

### Vercel (Frontend)

```bash
vercel                    # Deploy to preview
vercel --prod             # Deploy to production
vercel env ls             # List environment variables
vercel env add            # Add environment variable
vercel logs               # View logs
vercel inspect            # View deployment info
vercel domains            # Manage custom domains
```

---

## 🚀 Deployment Scripts

We've created helper scripts to automate deployment:

### Backend Deployment

```bash
chmod +x deploy-railway.sh
./deploy-railway.sh
```

This script will:
- Check if Railway CLI is installed
- Generate a secure `SECRET_KEY`
- Set environment variables
- Add PostgreSQL
- Deploy to Railway

### Frontend Deployment

```bash
chmod +x deploy-vercel.sh
./deploy-vercel.sh
```

This script will:
- Check if Vercel CLI is installed
- Prompt for Railway backend URL
- Deploy to Vercel
- Provide post-deployment instructions

---

## 📈 Next Steps

After deployment:

1. **Test thoroughly**
   - Sign up with multiple accounts
   - Test login/logout
   - Verify JWT tokens work
   - Test on mobile devices

2. **Set up monitoring**
   - Enable Vercel Analytics
   - Set up Railway alerts for errors
   - Monitor database usage

3. **Custom domains** (optional)
   - Add custom domain in Vercel
   - Add custom domain in Railway
   - Update CORS and environment variables

4. **Backups**
   - Railway automatically backs up PostgreSQL
   - Set up additional backup strategy if needed

5. **Scale as needed**
   - Railway: Upgrade plan for more resources
   - Vercel: Pro plan for unlimited bandwidth

---

## 💰 Cost Estimate

**Free Tier:**
- Railway: $5 credit/month (enough for small apps)
- Vercel: Unlimited deployments, 100GB bandwidth

**If you exceed free tier:**
- Railway: ~$5-20/month depending on usage
- Vercel: $20/month for Pro (unlimited bandwidth)

---

## 🆘 Support

If you run into issues:

1. Check Railway logs: `railway logs`
2. Check Vercel logs in dashboard
3. Test API endpoints directly with curl or Postman
4. Verify all environment variables are set
5. Check database connection

---

## ✅ Deployment Complete!

Your authentication system is now live in production! 🎉

- **Frontend:** https://your-app.vercel.app
- **Backend:** https://your-backend.railway.app
- **API Docs:** https://your-backend.railway.app/docs

Users can now:
- Sign up for accounts
- Log in with email/password
- Access protected routes
- All data is stored in PostgreSQL

---

**Need help?** Open the Railway or Vercel dashboards to monitor your deployments.
