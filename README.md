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

### ✅ Completed

- ✅ Landing page with service overview
- ✅ Schema Generator tool
  - Product schema
  - Article schema
  - FAQ schema
  - How-to schema
  - Organization schema
- ✅ AI Visibility Health-Check (frontend)
  - Multi-page input
  - Question collection
  - Results display with score and recommendations

### 🚧 In Progress

- 🔨 Backend API for health check analysis
- 🔨 Admin dashboard
- 🔨 Email notifications

### 📋 Planned

- 📅 User authentication
- 📅 Payment integration (Stripe)
- 📅 Full PDF report generation
- 📅 AI mention tracking (Service #3)
- 📅 Advanced analytics dashboard

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
- Website: [Coming Soon]
- Email: [Your Email]

---

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Landing page
- ✅ Schema generator
- ✅ Health check (frontend)
- 🔨 Backend API

### Phase 2
- Admin dashboard
- User accounts
- Payment processing
- Email automation

### Phase 3
- 24/7 AI mention alerts
- Advanced analytics
- Enterprise features
- API access for partners

---

## 🙏 Acknowledgments

Built with modern web technologies and AI-powered analysis to help businesses stay visible in the age of generative search.
