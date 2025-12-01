# 🚀 Deployment Checklist

Quick checklist to deploy your authentication system to production.

---

## Before You Start

- [ ] You have a Railway account ([sign up](https://railway.app))
- [ ] You have a Vercel account ([sign up](https://vercel.com))
- [ ] You have your API keys ready:
  - [ ] OpenAI API key
  - [ ] Anthropic API key
  - [ ] Google API key
- [ ] Your code is pushed to GitHub

---

## Step 1: Deploy Backend to Railway (15 minutes)

### Install Railway CLI

```bash
# macOS
brew install railway

# or via npm
npm install -g @railway/cli
```

### Deploy Backend

**Option A: Use our script (easiest)**

```bash
./deploy-railway.sh
```

**Option B: Manual deployment**

```bash
cd backend

# Login
railway login

# Create project
railway init

# Add PostgreSQL
railway add

# Generate secret key
python3 -c 'import secrets; print(secrets.token_urlsafe(32))'

# Set environment variables (use the generated key above)
railway variables --set "SECRET_KEY=your-generated-key"
railway variables --set "DEBUG=false"

# Add API keys in Railway dashboard:
railway open
# → Variables → Add:
# - OPENAI_API_KEY
# - ANTHROPIC_API_KEY
# - GOOGLE_API_KEY

# Deploy
railway up

# Get your backend URL
railway domain
```

**Save your backend URL!** You'll need it for the frontend.

Example: `https://geo-app-backend-production.up.railway.app`

---

## Step 2: Deploy Frontend to Vercel (10 minutes)

### Install Vercel CLI

```bash
npm install -g vercel
```

### Deploy Frontend

**Option A: Use our script**

```bash
./deploy-vercel.sh
```

**Option B: Manual deployment**

```bash
cd frontend

# Deploy
vercel --prod

# After deployment, add environment variable:
# Go to Vercel Dashboard → Your Project → Settings → Environment Variables
# Add: NEXT_PUBLIC_API_URL = https://your-backend.railway.app

# Redeploy
vercel --prod
```

---

## Step 3: Connect Frontend & Backend

### Update Backend CORS

In Railway dashboard:
1. Go to your backend project
2. Variables → Add/Update:
   - `FRONTEND_URL` = `https://your-app.vercel.app`
   - `PRODUCTION_URL` = `https://your-app.vercel.app`

Railway will auto-redeploy.

---

## Step 4: Test Authentication

1. **Sign Up**
   - Go to: `https://your-app.vercel.app/signup`
   - Create a test account
   - Should redirect after successful signup

2. **Login**
   - Go to: `https://your-app.vercel.app/login`
   - Login with test credentials
   - Should redirect to dashboard

3. **Verify Database**
   ```bash
   cd backend
   railway run psql $DATABASE_URL
   SELECT * FROM users;
   ```

---

## ✅ Done!

Your authentication system is now live:

- **Frontend:** https://your-app.vercel.app
- **Backend:** https://your-backend.railway.app
- **API Docs:** https://your-backend.railway.app/docs

---

## 🐛 Troubleshooting

### Backend won't deploy
- Check logs: `railway logs`
- Verify all environment variables are set
- Make sure PostgreSQL is added

### Frontend can't connect to backend
- Verify `NEXT_PUBLIC_API_URL` is set in Vercel
- Check CORS settings in Railway (FRONTEND_URL)
- No trailing slashes in URLs

### Database tables not created
- Tables are auto-created on first run
- Check logs: `railway logs`
- Manually create: `railway run python -c "from app.database import init_db; init_db()"`

---

## 📚 Full Documentation

For detailed instructions, see:
- **PRODUCTION_DEPLOYMENT.md** - Complete deployment guide
- **deploy-railway.sh** - Backend deployment script
- **deploy-vercel.sh** - Frontend deployment script

---

## 🆘 Need Help?

1. Check Railway logs: `railway logs`
2. Check Vercel logs in dashboard
3. Test API directly: `curl https://your-backend.railway.app/`
4. Verify environment variables are set correctly
