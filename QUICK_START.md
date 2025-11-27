# 🚀 Quick Start - Dwight

## Option 1: Simple Demo (No Setup Required) ⚡

**Just open this file in your browser:**
```
demo.html
```

Double-click the file or open it in Chrome/Firefox to see the Schema Generator working!

---

## Option 2: Full App (Requires Setup) 🛠️

### Step 1: Install Everything

Run this one command:
```bash
./setup.sh
```

OR manually:

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Start the Apps

Open **TWO terminals**:

**Terminal 1 - Frontend:**
```bash
./start-frontend.sh
```
OR manually:
```bash
cd frontend
npm run dev
```

**Terminal 2 - Backend:**
```bash
./start-backend.sh
```
OR manually:
```bash
cd backend
python -m uvicorn app.main:app --reload
```

### Step 3: Visit the App

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000/docs

---

## 🧪 Test It Works

1. **Open demo.html** - Should work immediately in browser
2. **Try Schema Generator** - Fill form, click generate
3. **Copy the code** - Click "Copy Code" button

---

## ❓ Troubleshooting

### "npm not found"
Install Node.js: https://nodejs.org

### "pip not found"
Install Python: https://www.python.org/downloads/

### Port already in use
```bash
# Change frontend port
cd frontend
npm run dev -- -p 3001

# Change backend port
cd backend
uvicorn app.main:app --port 8001
```

### Still not working?
Just use **demo.html** - it works without any installation!

---

## ✅ What Works Right Now

- ✅ demo.html - Schema Generator (works immediately!)
- ✅ Full Next.js app (after npm install)
- ✅ FastAPI backend (after pip install)
- ✅ Landing page
- ✅ Both tools (Schema + Health Check)

---

## 🎯 Next Steps

1. Open demo.html - See it work instantly
2. Install dependencies - Run setup.sh
3. Start both servers - Use start scripts
4. Customize - Edit colors, text, branding
5. Deploy - Push to Vercel/Railway when ready

Need help? Check GETTING_STARTED.md for details!
