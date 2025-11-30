"""SQLAlchemy database models"""
from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, Float, JSON
from sqlalchemy.sql import func
from app.database import Base


class WaitlistEntry(Base):
    """Waitlist signup entries"""
    __tablename__ = "waitlist_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    position = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String(50), default="pending")  # pending, invited, converted


class ContactSubmission(Base):
    """Contact form submissions"""
    __tablename__ = "contact_submissions"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    company = Column(String(255))
    service = Column(String(100))
    message = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String(50), default="new")  # new, contacted, resolved


class HealthCheckReport(Base):
    """Health check analysis reports"""
    __tablename__ = "health_check_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(255))
    contact_email = Column(String(255))
    overall_score = Column(Integer)
    total_pages = Column(Integer)
    pages_analyzed = Column(JSON)  # Store detailed page analysis as JSON
    top_issues = Column(JSON)
    top_strengths = Column(JSON)
    recommendations = Column(JSON)
    ai_visibility = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class SchemaGeneration(Base):
    """Schema generation history"""
    __tablename__ = "schema_generations"

    id = Column(Integer, primary_key=True, index=True)
    schema_type = Column(String(50), nullable=False)
    input_data = Column(JSON)
    generated_schema = Column(Text)
    user_email = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class VisibilityTest(Base):
    """AI Visibility test results tracking"""
    __tablename__ = "visibility_tests"

    id = Column(Integer, primary_key=True, index=True)
    # Brand info
    brand_name = Column(String(255), nullable=False, index=True)
    website_url = Column(String(500))
    industry = Column(String(100))
    category = Column(String(100))
    location = Column(String(255))  # City, region for local businesses
    scope = Column(String(20))  # global, national, local
    is_local_business = Column(Boolean, default=False)

    # Test results
    overall_score = Column(Integer)  # 0-100
    grade = Column(String(2))  # A, B, C, D, F
    mention_rate = Column(Float)  # Percentage
    total_tests = Column(Integer)  # Number of prompts × models tested
    total_mentions = Column(Integer)  # How many times brand was mentioned

    # Competitors (top 3)
    top_competitors = Column(JSON)  # [{"name": "...", "score": 80}, ...]
    user_rank = Column(Integer)  # User's ranking among competitors

    # Models tested
    models_tested = Column(JSON)  # ["gpt-5.1", "claude-3.7", ...]
    model_performance = Column(JSON)  # {"gpt-5.1": 75, "claude": 80, ...}

    # Categories tested
    categories_tested = Column(JSON)  # ["vibe_check", "best_dish", ...]
    category_scores = Column(JSON)  # {"vibe_check": 60, "best_dish": 80, ...}

    # User info (optional)
    user_email = Column(String(255))
    user_ip = Column(String(50))  # For analytics, not personally identifying

    # Metadata
    test_duration_seconds = Column(Float)  # How long the test took
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    # Flags
    report_emailed = Column(Boolean, default=False)
    is_repeat_test = Column(Boolean, default=False)  # Same brand tested again


