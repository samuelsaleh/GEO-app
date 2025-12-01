"""
Create analytics tables
"""
from app.database import Base, engine
# Import existing models first so foreign keys work
from app.models.database import VisibilityTest, WaitlistEntry, ContactSubmission, HealthCheckReport
# Then import analytics models
from app.models.analytics import PromptTestResult, ModelTestResult, UserSession, PromptLibrary

print("Creating analytics tables...")
Base.metadata.create_all(bind=engine)
print("✅ Analytics tables created successfully!")
print("\nNew tables:")
print("  - prompt_test_results")
print("  - model_test_results")
print("  - user_sessions")
print("  - prompt_library")
