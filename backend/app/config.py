"""Application configuration"""
import os
from pydantic_settings import BaseSettings
from functools import lru_cache


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
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


settings = get_settings()

