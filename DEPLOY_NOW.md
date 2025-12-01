# 🚀 Deploy to Production - Step by Step

Follow these steps **in order**. Check off each one as you complete it.

---

## ✅ PART 1: RAILWAY BACKEND (10 minutes)

### Step 1: Create Railway Project
- [ ] Go to https://railway.app
- [ ] Click "Login" with GitHub
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Choose `GEO-app` repository
- [ ] Railway will start deploying (shows build logs)

**Wait for initial deployment to complete** (~2 minutes). You'll see "Success" in the logs.

---

### Step 2: Add PostgreSQL Database
- [ ] In your Railway project dashboard, click "+ New"
- [ ] Select "Database"
- [ ] Click "Add PostgreSQL"
- [ ] Wait for database to provision (~30 seconds)
- [ ] You'll see a new "PostgreSQL" card in your dashboard

**Important:** Railway automatically sets the `DATABASE_URL` variable. You don't need to add it manually!

---

### Step 3: Add Environment Variables

Click on your **backend service** (not the database) → "Variables" tab

Add these variables **one by one**:

```
SECRET_KEY
Por10cjLcETBYZWjYaKpmoT7X8dXMwq8JZyOL7EGOEA

DEBUG
False

FRONTEND_URL
https://your-vercel-app.vercel.app

PRODUCTION_URL
https://www.miageru-geo.com
```

**Note:** Replace the FRONTEND_URL with your actual Vercel URL once you deploy (Step 2). For now, use the default shown above.

After adding each variable, Railway will automatically redeploy.

**Checklist:**
- [ ] Added SECRET_KEY
- [ ] Added DEBUG=False
- [ ] Added FRONTEND_URL
- [ ] Added PRODUCTION_URL
- [ ] Deployment completed successfully (check logs)

---

### Step 4: Get Your Railway URL

- [ ] Click on your backend service
- [ ] Go to "Settings" tab
- [ ] Scroll to "Domains" section
- [ ] Copy the Railway domain (e.g., `geo-app-production.up.railway.app`)
- [ ] **Write it down** - you'll need it for Vercel!

**Your Railway URL:** _______________________________________

---

### Step 5: Test Backend

Run this command locally:

```bash
curl https://YOUR-RAILWAY-URL.up.railway.app/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "service": "dwight-api",
  "version": "1.0.2"
}
```

- [ ] Backend health check passes
- [ ] No errors in Railway logs

**If it fails:** Check Railway logs for errors. Common issues:
- Missing environment variables
- Database connection failed
- Port binding error

---

## ✅ PART 2: VERCEL FRONTEND (5 minutes)

### Step 1: Deploy to Vercel

- [ ] Go to https://vercel.com
- [ ] Click "Add New" → "Project"
- [ ] Click "Import" next to your `GEO-app` repository
- [ ] Configure settings:
  - Framework Preset: **Next.js** (auto-detected)
  - Root Directory: **frontend**
  - Build Command: `npm run build` (default)
  - Output Directory: `.next` (default)

### Step 2: Environment Variables (Optional)

Vercel project → "Settings" → "Environment Variables"

**Add this ONLY if you want to override the default:**

```
NEXT_PUBLIC_API_URL
https://YOUR-RAILWAY-URL.up.railway.app
```

**Note:** This is optional! The app auto-detects the Railway URL in production.

- [ ] Environment variables added (or skipped if using defaults)

### Step 3: Deploy

- [ ] Click "Deploy"
- [ ] Wait for build to complete (~2-3 minutes)
- [ ] Vercel shows "Congratulations!" when done

**Your Vercel URL:** _______________________________________

Example: `https://geo-app-git-main-yourname.vercel.app`

---

### Step 4: Update Railway CORS (Important!)

Now that you have your Vercel URL, go back to Railway:

- [ ] Railway → Backend service → "Variables" tab
- [ ] Update `FRONTEND_URL` to your actual Vercel URL
- [ ] Update `PRODUCTION_URL` if using custom domain
- [ ] Wait for Railway to redeploy

---

## ✅ PART 3: CREATE ADMIN USER (2 minutes)

### Option A: Using the Script (Recommended)

**Get your DATABASE_URL from Railway:**
1. Railway → PostgreSQL service → "Variables" tab
2. Copy the `DATABASE_URL` value (starts with `postgresql://`)

**Run the script:**

```bash
export DATABASE_URL="postgresql://postgres:..."  # Paste your actual URL
cd backend
source venv/bin/activate
python create_admin.py --email your@email.com --password YourPassword123 --name "Your Name"
```

**Checklist:**
- [ ] DATABASE_URL copied from Railway
- [ ] Admin script ran successfully
- [ ] Saw "✅ Admin user created successfully!"

---

### Option B: Via Signup + Database Update

1. Go to your Vercel URL
2. Click "Sign Up"
3. Create an account with your email
4. Go to Railway → PostgreSQL → "Data" tab
5. Find the `users` table
6. Find your user row
7. Click edit, set `is_admin` to `true`
8. Save

**Checklist:**
- [ ] Signed up on production site
- [ ] Updated `is_admin` to `true` in database

---

## ✅ PART 4: TEST EVERYTHING (5 minutes)

### Test 1: Admin Login

- [ ] Go to `https://YOUR-VERCEL-URL.vercel.app/login`
- [ ] Log in with admin credentials
- [ ] Should redirect to `/admin` dashboard
- [ ] Verify you see:
  - User analytics (Total Users, Active Users, etc.)
  - Users table with your admin account
  - Waitlist section

### Test 2: Regular User Signup

- [ ] Open incognito window
- [ ] Go to `https://YOUR-VERCEL-URL.vercel.app/signup`
- [ ] Create a test user account
- [ ] Should redirect to home page `/` (NOT `/admin`)
- [ ] Log out

### Test 3: Admin Dashboard Shows New User

- [ ] Log back in as admin
- [ ] Go to `/admin`
- [ ] Verify the new test user appears in the Users table
- [ ] Verify "Total Users" count increased

### Test 4: API Endpoints

```bash
# Test registration
curl -X POST https://YOUR-RAILWAY-URL.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'

# Should return user data with is_admin=false
```

- [ ] All tests pass
- [ ] No console errors in browser
- [ ] No errors in Railway logs

---

## ✅ PART 5: CUSTOM DOMAIN (Optional)

### On Vercel:

1. Vercel project → "Settings" → "Domains"
2. Add your domain (e.g., `miageru-geo.com`)
3. Follow DNS instructions from Vercel
4. Wait for DNS propagation (5-10 minutes)
5. Update `FRONTEND_URL` in Railway to your custom domain

**Checklist:**
- [ ] Custom domain added to Vercel
- [ ] DNS configured
- [ ] Domain verified
- [ ] Railway FRONTEND_URL updated

---

## 🎉 DEPLOYMENT COMPLETE!

You now have:
- ✅ Backend running on Railway with PostgreSQL
- ✅ Frontend running on Vercel
- ✅ Admin dashboard accessible
- ✅ User authentication working
- ✅ Database tracking all users
- ✅ Production-ready security

**Your Production URLs:**
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-app.up.railway.app`
- Admin: `https://your-app.vercel.app/admin`

**Admin Credentials:**
- Email: ___________________
- Password: ___________________

---

## 🔒 Post-Deployment Security

- [ ] Change admin password to something strong
- [ ] Delete test user accounts from database
- [ ] Verify `DEBUG=False` in Railway
- [ ] Verify `SECRET_KEY` is not the default
- [ ] Monitor Railway logs for suspicious activity

---

## 📊 Monitoring

**Railway Logs:**
- Railway → Backend service → "Logs" tab
- See all API requests in real-time

**Vercel Logs:**
- Vercel → Deployments → Click deployment → "Logs"
- See frontend build and runtime logs

**Database:**
- Railway → PostgreSQL → "Data" tab
- View and query user data

---

## 🆘 Troubleshooting

### Backend won't start
- Check Railway logs for error messages
- Verify all environment variables are set
- Verify PostgreSQL is running

### Frontend can't reach backend
- Check CORS settings in Railway
- Verify FRONTEND_URL matches Vercel domain
- Check Network tab in browser console

### Admin login fails
- Verify user exists in database
- Check `is_admin` is set to `true`
- Check `is_active` is set to `true`
- Try resetting password with `create_admin.py`

### Database connection fails
- Verify DATABASE_URL is set by Railway
- Check PostgreSQL is running
- Check Railway logs for connection errors

---

## 📞 Need Help?

- Check `PRODUCTION_SETUP.md` for detailed troubleshooting
- Review Railway deployment logs
- Check Vercel build logs
- Test endpoints with curl
- Inspect browser console for errors
