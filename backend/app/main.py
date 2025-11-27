from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import health_check, schema_generator, waitlist

app = FastAPI(
    title="Creed API",
    description="AI Search Visibility & Optimization Platform API",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://creed.app"],  # Update with your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_check.router, prefix="/api/health-check", tags=["health-check"])
app.include_router(schema_generator.router, prefix="/api/schema", tags=["schema"])
app.include_router(waitlist.router, prefix="/api/waitlist", tags=["waitlist"])

@app.get("/")
async def root():
    return {
        "message": "Creed API - AI Search Visibility Platform",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}
