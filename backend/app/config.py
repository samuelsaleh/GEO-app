"""Application configuration"""
import os
from pydantic_settings import BaseSettings
from pydantic import model_validator
from functools import lru_cache
import logging

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True
    
    # Database
    database_url: str = "sqlite:///./dwight.db"
    
    # Email
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    from_email: str = ""
    
    # AI APIs - Best models from each provider
    openai_api_key: str = ""           # For GPT-5.1
    anthropic_api_key: str = ""        # For Claude Opus 4.5 / Sonnet
    google_api_key: str = ""           # For Gemini Pro
    
    # AI Provider preference (which to try first)
    ai_provider_priority: str = "anthropic,openai,google"  # comma-separated
    
    # Security
    secret_key: str = "dev-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Frontend
    frontend_url: str = "http://localhost:3000"
    
    # Admin
    admin_email: str = "admin@dwight.app"

    @model_validator(mode='after')
    def validate_production_settings(self):
        """Validate that production settings are secure"""
        # Check if this is production (not debug mode)
        if not self.debug:
            # CRITICAL: Secret key must be changed in production
            if self.secret_key == "dev-secret-key-change-in-production":
                raise ValueError(
                    "🚨 SECURITY ERROR: Cannot use default SECRET_KEY in production! "
                    "Set a strong random key in your .env file."
                )

            # Warn if database is still SQLite in production
            if "sqlite" in self.database_url.lower():
                logger.warning(
                    "⚠️  WARNING: Using SQLite in production is not recommended. "
                    "Switch to PostgreSQL for production deployments."
                )

        # Always check for weak secret keys
        if len(self.secret_key) < 32:
            logger.warning(
                "⚠️  WARNING: SECRET_KEY should be at least 32 characters long. "
                "Generate a strong key with: python -c 'import secrets; print(secrets.token_urlsafe(32))'"
            )

        return self

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


settings = get_settings()

