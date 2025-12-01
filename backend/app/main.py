from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.api import health_check, schema_generator, waitlist, contact, visibility, competitive, admin, analytics
from app.config import settings
from app.database import init_db

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Configure rate limiting
limiter = Limiter(key_func=get_remote_address, default_limits=["100/hour"])


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    logger.info("🚀 Starting Dwight API...")
    init_db()
    logger.info("✅ Database initialized")
    yield
    logger.info("👋 Shutting down Dwight API...")


app = FastAPI(
    title="Dwight API",
    description="AI Search Visibility & Optimization Platform API",
    version="1.0.0",
    lifespan=lifespan
)

# Attach rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS configuration - Secure origins only
allowed_origins = [
    settings.frontend_url,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    # Production domains
    "https://www.miageru-geo.com",
    "https://miageru-geo.com",
    "https://geo-git-main-sams-projects-0418526d.vercel.app",
    "https://geo-s9l0rga16-sams-projects-0418526d.vercel.app",
]

# Add production domains if set
if hasattr(settings, 'production_url') and settings.production_url:
    allowed_origins.append(settings.production_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # Only allow specific origins
    allow_credentials=True,  # Can now be True with specific origins
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Be explicit
    allow_headers=["Content-Type", "Authorization"],
)

# Include routers
app.include_router(health_check.router, prefix="/api/health-check", tags=["Health Check"])
app.include_router(schema_generator.router, prefix="/api/schema", tags=["Schema Generator"])
app.include_router(waitlist.router, prefix="/api/waitlist", tags=["Waitlist"])
app.include_router(contact.router, prefix="/api/contact", tags=["Contact"])
app.include_router(visibility.router, prefix="/api/visibility", tags=["AI Visibility Monitor"])
app.include_router(competitive.router, prefix="/api/competitive", tags=["Competitive Testing"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin Dashboard"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics & Insights"])


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "Dwight API",
        "description": "AI Search Visibility & Optimization Platform",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "health_check": "/api/health-check/analyze",
            "schema_generator": "/api/schema/generate",
            "visibility_check": "/api/visibility/check",
            "visibility_quick": "/api/visibility/quick-check",
            "competitive_products": "/api/competitive/products",
            "competitive_full_test": "/api/competitive/full-test",
            "waitlist": "/api/waitlist/join",
            "contact": "/api/contact/submit"
        }
    }


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "dwight-api",
        "version": "1.0.2"
    }
