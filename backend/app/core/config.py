"""
Core configuration module for the IMS Backend.

This module handles all application configuration using Pydantic Settings.
Environment variables are loaded from .env file.
"""

from typing import Union

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    app_name: str = "IMS Backend"
    app_version: str = "1.0.0"
    debug: bool = True

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # Database
    database_url: str = (
        "postgresql+asyncpg://ims_user:ims_password@localhost:5432/ims_db"
    )

    # Security
    secret_key: str = "dev-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    access_token_refresh_window_minutes: int = 5

    # CORS - stored as string in env, parsed to list
    cors_origins: Union[str, list[str]] = (
        "http://localhost:8000,http://127.0.0.1:8000,"
        "http://localhost:8081,http://127.0.0.1:8081,"
        "http://localhost:19000,http://localhost:19006"
    )

    # Logging
    log_level: str = "INFO"

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        """Parse CORS origins from comma-separated string or list."""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


# Global settings instance
settings = Settings()
