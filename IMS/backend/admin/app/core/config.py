"""
Application Configuration
"""
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    """Application settings"""
    
    # App
    app_name: str = "Admin Dashboard API"
    app_version: str = "1.0.0"
    debug: bool = True
    
    # Database
    database_url: Optional[str] = None
    
    # Security
    secret_key: str = "your-secret-key-change-in-production"
    access_token_expire_minutes: int = 30
    
    class Config:
        env_file = ".env"

settings = Settings()
