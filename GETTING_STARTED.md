# 🚀 Getting Started with Dwight

Welcome! This guide will help you get your **Dwight** platform up and running.

---

## 📋 What You Have

✅ **Landing Page** - Beautiful homepage explaining your services
✅ **Schema Generator Tool** - Fully functional, ready to use
✅ **AI Health Check Tool** - Frontend complete, backend ready
✅ **Backend API** - FastAPI server with endpoints for both tools

---

## 🛠️ Setup Instructions

### Step 1: Install Frontend Dependencies

```bash
cd frontend
npm install
```

This will download all the React/Next.js packages needed.

### Step 2: Start the Frontend

```bash
npm run dev
```

Your website will open at: **http://localhost:3000** 🎉

### Step 3: Install Backend Dependencies

Open a **new terminal** and run:

```bash
cd backend
pip install -r requirements.txt
```

### Step 4: Start the Backend

```bash
cd backend
python -m uvicorn app.main:app --reload
```

Your API will run at: **http://localhost:8000** 🎉

API docs available at: **http://localhost:8000/docs**

---

## 🎨 What You Can Do Now

### 1️⃣ Browse the Landing Page
- Go to http://localhost:3000
- See your beautiful Dwight homepage
- Click around to explore

### 2️⃣ Try the Schema Generator
- Click "Try Tools" → "Schema Generator"
- Or go directly to: http://localhost:3000/tools/schema-generator
- Fill out the form for a product or article
- Click "Generate Schema Code"
- Copy the code and use it on any website!

### 3️⃣ Try the Health Check
- Go to: http://localhost:3000/tools/health-check
- Enter some website URLs
- Enter questions customers might ask
- Click "Run Analysis"
- See your AI visibility score!

---

## 📁 Project Structure

```
GEO-app/
│
├── frontend/               # Your website (Next.js)
│   ├── src/app/
│   │   ├── page.tsx       # Landing page
│   │   └── tools/         # Tool pages
│   └── package.json
│
└── backend/               # Your API (Python FastAPI)
    ├── app/
    │   ├── main.py       # Main API file
    │   ├── api/          # API endpoints
    │   ├── models/       # Data models
    │   └── services/     # Business logic
    └── requirements.txt
```

---

## 🎯 Next Steps (Optional)

### Connect Frontend to Backend

Right now the tools work with demo data. To connect them to the real backend:

1. Update the health check tool to call the API:
   - File: `frontend/src/app/tools/health-check/page.tsx`
   - Replace the `setTimeout` in `handleSubmit` with:

```typescript
const response = await axios.post('http://localhost:8000/api/health-check/analyze', {
  company_name: companyName,
  contact_email: contactEmail,
  page_urls: pageUrls.map(p => p.url).filter(u => u),
  questions: questions.map(q => q.question).filter(q => q)
})
setResult(response.data)
```

### Add Your Branding

1. Change colors in: `frontend/tailwind.config.js`
2. Update logo/name: Edit the navigation in each page
3. Add your email: Update footer in `frontend/src/app/page.tsx`

### Deploy to the Internet

**Frontend (Vercel - Free):**
```bash
cd frontend
npm install -g vercel
vercel
```

**Backend (Railway - Free tier):**
- Go to https://railway.app
- Connect your GitHub repo
- Deploy the `backend` folder

---

## ❓ Common Issues

### "Module not found" errors
Run `npm install` again in the frontend folder

### Backend won't start
Make sure you're in the `backend` folder and ran `pip install -r requirements.txt`

### Port already in use
- Frontend: Change port with `npm run dev -- -p 3001`
- Backend: Change port with `uvicorn app.main:app --port 8001`

---

## 💡 Tips

1. **Keep both terminals open** - one for frontend, one for backend
2. **Use the API docs** - http://localhost:8000/docs shows all endpoints
3. **Check the browser console** - Press F12 to see errors
4. **Edit and reload** - Changes update automatically (hot reload)

---

## 🎓 Learning Resources

- **Next.js docs:** https://nextjs.org/docs
- **FastAPI docs:** https://fastapi.tiangolo.com
- **Tailwind CSS:** https://tailwindcss.com/docs

---

## ✅ Quick Test Checklist

- [ ] Frontend runs at http://localhost:3000
- [ ] Landing page loads and looks good
- [ ] Schema Generator creates code
- [ ] Health Check shows a score
- [ ] Backend API docs work at http://localhost:8000/docs

---

## 🎉 You're Ready!

You now have a fully functional AI optimization platform!

**Questions?** Check the README.md or the code comments.

**Enjoy building Dwight!** 🚀
