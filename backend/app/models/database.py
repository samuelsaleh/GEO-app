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


