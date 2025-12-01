"""
Analytics and detailed tracking models
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, Float, JSON, ForeignKey
from sqlalchemy.sql import func
from app.database import Base


class PromptTestResult(Base):
    """Individual prompt test results - track each question asked"""
    __tablename__ = "prompt_test_results"

    id = Column(Integer, primary_key=True, index=True)
    visibility_test_id = Column(Integer, ForeignKey('visibility_tests.id'))

    # The specific prompt/question
    prompt_text = Column(Text, nullable=False)
    prompt_category = Column(String(50))  # recommendation, comparison, reputation, etc.

    # Results from this prompt
    brand_mentioned = Column(Boolean, default=False)
    mention_position = Column(Integer)  # 1st, 2nd, 3rd etc.
    competitors_mentioned = Column(JSON)  # List of competitors mentioned

    # Quality metrics
    response_relevance_score = Column(Float)  # 0-1, how relevant was the answer
    prompt_effectiveness = Column(Float)  # 0-1, did it surface the brand

    # The actual AI response
    ai_response_preview = Column(Text)  # First 500 chars of response

    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)


class ModelTestResult(Base):
    """Per-model test results - track each AI model's performance"""
    __tablename__ = "model_test_results"

    id = Column(Integer, primary_key=True, index=True)
    visibility_test_id = Column(Integer, ForeignKey('visibility_tests.id'))
    prompt_test_id = Column(Integer, ForeignKey('prompt_test_results.id'))

    # Model info
    model_id = Column(String(100), nullable=False, index=True)  # gpt-5.1, claude-sonnet-4
    model_name = Column(String(100))
    provider = Column(String(50))  # openai, anthropic, google

    # Results
    brand_mentioned = Column(Boolean, default=False)
    mention_position = Column(Integer)
    sentiment = Column(String(50))  # positive, neutral, negative
    confidence_score = Column(Float)  # How confident was the model

    # Performance
    response_time_ms = Column(Integer)  # How long to get response
    tokens_used = Column(Integer)  # Cost tracking

    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)


class UserSession(Base):
    """Track user sessions and behavior"""
    __tablename__ = "user_sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(255), unique=True, index=True)

    # User identification (anonymous)
    user_ip_hash = Column(String(64))  # Hashed IP for privacy
    user_agent = Column(Text)

    # Session info
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    last_activity = Column(DateTime(timezone=True))
    total_duration_seconds = Column(Integer, default=0)

    # Actions taken
    pages_visited = Column(JSON)  # List of pages
    tools_used = Column(JSON)  # Which tools they tried
    tests_completed = Column(Integer, default=0)

    # Conversion tracking
    joined_waitlist = Column(Boolean, default=False)
    submitted_contact = Column(Boolean, default=False)

    # Geography (from IP)
    country = Column(String(50))
    city = Column(String(100))


class PromptLibrary(Base):
    """Library of prompts with performance metrics"""
    __tablename__ = "prompt_library"

    id = Column(Integer, primary_key=True, index=True)
    prompt_text = Column(Text, unique=True, nullable=False)
    category = Column(String(50), index=True)
    industry = Column(String(100))  # Which industry this works for

    # Performance metrics
    times_used = Column(Integer, default=0)
    success_rate = Column(Float, default=0.0)  # % that found the brand
    avg_mention_position = Column(Float)
    avg_score = Column(Float)

    # Quality indicators
    is_effective = Column(Boolean, default=True)
    effectiveness_score = Column(Float)  # 0-100

    # Versioning
    version = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_updated = Column(DateTime(timezone=True), onupdate=func.now())
