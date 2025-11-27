# Creed - AI Search Visibility & Optimization Platform

**Ensure your brand is visible in ChatGPT, Bing Chat, and other AI answer engines**

---

## 🎯 Overview

Creed helps businesses optimize their content for generative AI search engines. As users increasingly turn to AI assistants like ChatGPT, Bing Chat, and Google Gemini for answers, traditional SEO isn't enough. Creed provides the tools and services to ensure your brand gets mentioned, cited, and recommended by AI.

### Core Services

1. **AI Visibility Health-Check** - Comprehensive audit showing where your pages appear (or vanish) in AI-generated answers
2. **Schema Generator** - Create perfect schema markup to help AI engines understand your content

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+ (for backend)

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3000`

### Backend Setup (Coming Soon)

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

---

## 📁 Project Structure

```
GEO-app/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # Next.js app router pages
│   │   │   ├── page.tsx     # Landing page
│   │   │   └── tools/       # Tool pages
│   │   │       ├── health-check/
│   │   │       └── schema-generator/
│   │   ├── components/      # Reusable React components
│   │   └── lib/            # Utilities and helpers
│   └── public/             # Static assets
│
├── backend/                # Python FastAPI backend
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── models/        # Data models
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utilities
│   └── requirements.txt
│
└── docs/                  # Documentation
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (React)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **HTTP Client:** Axios

### Backend (Coming)
- **Framework:** FastAPI (Python)
- **Database:** PostgreSQL
- **AI Integration:** OpenAI API, Anthropic Claude API
- **Task Queue:** Celery (for background jobs)

---

## 🎨 Features

### ✅ Completed (v1.0)

**Frontend:**
- ✅ Landing page with service overview & waitlist
- ✅ Schema Generator tool (5 schema types)
- ✅ AI Visibility Health-Check tool
- ✅ About page
- ✅ Contact page with form
- ✅ Pricing page with detailed breakdown
- ✅ Tools hub page
- ✅ Admin dashboard with analytics
- ✅ Responsive design (mobile-friendly)
- ✅ API integration with error handling

**Backend:**
- ✅ FastAPI REST API
- ✅ Health check analysis endpoint
- ✅ Schema generation endpoint
- ✅ Waitlist management
- ✅ Content analyzer service
- ✅ Email notification system
- ✅ Background task processing
- ✅ API documentation (Swagger/ReDoc)

**Tools & Documentation:**
- ✅ Standalone HTML demos
- ✅ Setup scripts (one-command install)
- ✅ Deployment guide (Vercel/Railway)
- ✅ Complete feature documentation
- ✅ Quick start guide

### 📋 Planned (v2.0)

- 📅 User authentication & accounts
- 📅 Payment integration (Stripe)
- 📅 Database integration (PostgreSQL)
- 📅 PDF report generation
- 📅 24/7 AI mention alerts (Service #3)
- 📅 Advanced analytics dashboard
- 📅 Team collaboration features

---

## 🧪 Development

### Running Tests

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
pytest
```

### Building for Production

```bash
# Frontend
cd frontend
npm run build
npm start

# Backend
cd backend
# Docker build coming soon
```

---

## 📖 API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## 🤝 Contributing

This is a private project. For questions or contributions, please contact the project owner.

---

## 📄 License

Proprietary - All rights reserved

---

## 📞 Contact

For inquiries about Creed services:
- Website: http://localhost:3000 (development)
- Email: hello@creed.app
- Admin Dashboard: http://localhost:3000/admin

## 🎓 Learning & Documentation

- **QUICK_START.md** - Get running in 5 minutes
- **GETTING_STARTED.md** - Detailed setup walkthrough
- **DEPLOYMENT.md** - Production deployment guide
- **FEATURES.md** - Complete feature list (100+ features!)
- **demo.html** - Try Schema Generator instantly (no setup!)
- **API Docs** - http://localhost:8000/docs (when backend running)

---

## 🎯 Roadmap

### Phase 1 (v1.0) ✅ COMPLETE
- ✅ Landing page with waitlist
- ✅ Schema generator (5 types)
- ✅ Health check tool (full stack)
- ✅ Backend API
- ✅ About, Contact, Pricing pages
- ✅ Admin dashboard
- ✅ Email notifications
- ✅ Deployment documentation

### Phase 2 (v2.0) - Q1 2025
- User accounts & authentication
- Payment integration (Stripe)
- PostgreSQL database
- PDF report generation
- Advanced email templates
- Enhanced analytics

### Phase 3 (v3.0) - Q2 2025
- 24/7 AI mention alerts
- Real-time monitoring
- Team collaboration
- API access
- Webhook integrations
- Mobile app

### Phase 3
- 24/7 AI mention alerts
- Advanced analytics
- Enterprise features
- API access for partners

---

## 🙏 Acknowledgments

Built with modern web technologies and AI-powered analysis to help businesses stay visible in the age of generative search.
