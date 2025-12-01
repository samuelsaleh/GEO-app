# 🚀 Production Setup Guide

Complete guide to deploy Miageru GEO to production (Railway + Vercel).

---

## 📋 Prerequisites

- GitHub repository pushed
- Railway account (railway.app)
- Vercel account (vercel.com)

---

## 🛤️ Part 1: Railway Backend Setup

### Step 1: Create New Project

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `GEO-app` repository
5. Railway will auto-detect the backend

### Step 2: Add PostgreSQL Database

1. In your Railway project, click "+ New"
2. Select "Database" → "PostgreSQL"
3. Railway automatically sets `DATABASE_URL` environment variable
4. Wait for database to provision (~30 seconds)

### Step 3: Configure Environment Variables

Click on your backend service → "Variables" tab → Add these:

```bash
# REQUIRED - Security
SECRET_KEY=Por10cjLcETBYZWjYaKpmoT7X8dXMwq8JZyOL7EGOEA

# REQUIRED - Production mode
DEBUG=False

# REQUIRED - Frontend URLs (update with your actual domains)
FRONTEND_URL=https://miageru-geo.com
PRODUCTION_URL=https://www.miageru-geo.com

# OPTIONAL - AI API Keys (for features that need them)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...

# OPTIONAL - Email (if you want contact form emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@miageru-geo.com
```

**Important Notes:**
- `DATABASE_URL` is automatically set by Railway when you add PostgreSQL
- `SECRET_KEY` is already generated above - use it!
- Update `FRONTEND_URL` and `PRODUCTION_URL` with your actual Vercel domains

### Step 4: Deploy

1. Railway automatically deploys after adding environment variables
2. Wait for deployment to complete (~2 minutes)
3. Check logs to confirm: "✅ Database initialized"
4. Note your Railway URL: `https://geo-app-production-339e.up.railway.app`

### Step 5: Test Backend

```bash
curl https://geo-app-production-339e.up.railway.app/health
```

Should return:
```json
{
  "status": "healthy",
  "service": "dwight-api",
  "version": "1.0.2"
}
```

---

## 🔷 Part 2: Vercel Frontend Setup

### Step 1: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your `GEO-app` repository
4. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)

### Step 2: Environment Variables (Optional)

Vercel project → "Settings" → "Environment Variables":

```bash
# Optional - only if you want to override the default Railway URL
NEXT_PUBLIC_API_URL=https://geo-app-production-339e.up.railway.app
```

**Note:** This is optional! The app auto-detects the Railway URL in production.

### Step 3: Deploy

1. Click "Deploy"
2. Wait for build to complete (~2 minutes)
3. Vercel gives you a URL like: `https://geo-app-xxx.vercel.app`

### Step 4: Custom Domain (Optional)

1. Vercel project → "Settings" → "Domains"
2. Add your custom domain (e.g., `miageru-geo.com`)
3. Follow Vercel's DNS instructions
4. Wait for DNS propagation (~5-10 minutes)

---

## 👤 Part 3: Create First Admin User

### Option A: Using the Script (Recommended)

**On Railway:**

1. Go to Railway project → Backend service
2. Click "Settings" → "Deploy"
3. SSH into the container or use Railway's CLI
4. Run:

```bash
python create_admin.py --email admin@miageru-geo.com --password YourStrongPassword123
```

**Locally (connecting to production database):**

1. Copy `DATABASE_URL` from Railway
2. Run locally:

```bash
export DATABASE_URL="postgresql://..."
cd backend
source venv/bin/activate
python create_admin.py --email admin@miageru-geo.com --password YourStrongPassword123
```

### Option B: Using Railway PostgreSQL Dashboard

1. Railway project → PostgreSQL service → "Data" tab
2. Click "+ Add Row" on `users` table
3. Fill in:
   - `email`: admin@miageru-geo.com
   - `hashed_password`: (use the hash from script or local account)
   - `is_admin`: `true`
   - `is_active`: `true`
   - `subscription_tier`: `premium`

### Option C: Create via Signup + Database Update

1. Go to `https://miageru-geo.com/signup`
2. Sign up with your admin email
3. Go to Railway → PostgreSQL → "Data" tab
4. Find your user in the `users` table
5. Edit: Set `is_admin` to `true`

---

## 🧪 Part 4: Test Production

### Test 1: Backend Health Check

```bash
curl https://geo-app-production-339e.up.railway.app/health
```

Expected: `{"status": "healthy", ...}`

### Test 2: Admin Login

1. Go to `https://miageru-geo.com/login`
2. Log in with admin credentials
3. Should redirect to `/admin` dashboard
4. Verify you see:
   - User analytics (Total Users, Active Users, etc.)
   - Users table
   - Waitlist signups

### Test 3: Regular User Signup

1. Go to `https://miageru-geo.com/signup`
2. Create a test user account
3. Should redirect to home page `/` (NOT /admin)
4. Log in as admin to see the new user in dashboard

### Test 4: API Endpoints

```bash
# Test authentication
curl -X POST https://geo-app-production-339e.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 🔧 Troubleshooting

### Issue: Backend fails to start

**Check Railway logs:**
1. Railway project → Backend service → "Logs" tab
2. Look for error messages

**Common issues:**
- `SECRET_KEY` not set → Add it to environment variables
- Database connection failed → Verify PostgreSQL is running
- Port binding error → Railway auto-assigns `$PORT`, no action needed

### Issue: Frontend can't reach backend

**Check CORS:**
1. Verify `FRONTEND_URL` in Railway matches your Vercel domain
2. Check backend logs for CORS errors
3. Verify frontend is using correct API URL

**Debug API URL:**
Open browser console on your site and run:
```javascript
console.log(process.env.NEXT_PUBLIC_API_URL)
```

### Issue: Admin user can't log in

**Check database:**
1. Railway → PostgreSQL → "Data" tab
2. Verify user exists in `users` table
3. Check `is_admin` is `true`
4. Check `is_active` is `true`

**Check password:**
Password might be incorrect. Reset via:
```bash
python create_admin.py --email admin@miageru-geo.com --password NewPassword123
```

### Issue: "Account is disabled"

Set `is_active` to `true` in database:
```sql
UPDATE users SET is_active = true WHERE email = 'admin@miageru-geo.com';
```

---

## 📊 Monitoring Production

### View Logs

**Railway Backend:**
- Railway project → Backend service → "Logs" tab
- Real-time logs of all requests

**Vercel Frontend:**
- Vercel project → "Deployments" → Click deployment → "Logs"
- Build and runtime logs

### Database Access

**Railway PostgreSQL:**
- Railway project → PostgreSQL → "Data" tab
- Browse tables, run SQL queries

**Connect via CLI:**
```bash
# Get connection string from Railway
psql <DATABASE_URL>

# View users
SELECT email, is_admin, subscription_tier, created_at FROM users;
```

### Analytics

**Admin Dashboard:**
- `https://miageru-geo.com/admin`
- View user signups, analytics, activity

---

## 🔐 Security Checklist

- [ ] `SECRET_KEY` is set to strong random value (not default)
- [ ] `DEBUG=False` in production
- [ ] PostgreSQL database (not SQLite)
- [ ] Admin user created with strong password
- [ ] CORS configured with specific domains (not `*`)
- [ ] HTTPS enabled (automatic with Vercel/Railway)
- [ ] Environment variables secured (not in code)
- [ ] API rate limiting enabled (already configured)

---

## 🎉 You're Done!

Your production environment is ready:

- ✅ Backend: Railway with PostgreSQL
- ✅ Frontend: Vercel with Next.js
- ✅ Admin dashboard: `/admin`
- ✅ User authentication: JWT-based
- ✅ Database: PostgreSQL with auto-migrations
- ✅ Security: CORS, rate limiting, password hashing

**Admin Login:**
- URL: `https://miageru-geo.com/login`
- Email: `admin@miageru-geo.com`
- Password: (whatever you set)

**Next Steps:**
1. Update admin password to something secure
2. Test all features in production
3. Monitor logs for any errors
4. Set up monitoring/alerts (optional)

---

## 📞 Need Help?

Check the logs:
- Railway backend logs
- Vercel deployment logs
- Browser console for frontend errors
- Database tables in Railway PostgreSQL
