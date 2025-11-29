from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.api import health_check, schema_generator, waitlist, contact, visibility, competitive
from app.config import settings
from app.database import init_db

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


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

# CORS configuration - Allow all origins for now (can be restricted later)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,  # Must be False when using "*"
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_check.router, prefix="/api/health-check", tags=["Health Check"])
app.include_router(schema_generator.router, prefix="/api/schema", tags=["Schema Generator"])
app.include_router(waitlist.router, prefix="/api/waitlist", tags=["Waitlist"])
app.include_router(contact.router, prefix="/api/contact", tags=["Contact"])
app.include_router(visibility.router, prefix="/api/visibility", tags=["AI Visibility Monitor"])
app.include_router(competitive.router, prefix="/api/competitive", tags=["Competitive Testing"])


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
        "version": "1.0.0"
    }
