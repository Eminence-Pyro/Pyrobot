"""
Pyrobot — Application Configuration
Reads all settings from environment variables / .env file.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    # ── DATABASE ──────────────────────────────────────────────
    DATABASE_URL: str

    # ── AUTHENTICATION ────────────────────────────────────────
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── AI PROVIDERS ──────────────────────────────────────────
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    GOOGLE_API_KEY: str = ""
    DEFAULT_AI_MODEL: str = "gpt-4o"

    # ── CORS ──────────────────────────────────────────────────
    # Note: Ensure .env value is JSON format: ["http://localhost:3000"]
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    # ── STORAGE ───────────────────────────────────────────────
    STORAGE_BACKEND: str = "local"

    # ── MODERN CONFIGURATION ──────────────────────────────────
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"  # This prevents crashes from NEXT_PUBLIC_ variables
    )


settings = Settings() # type: ignore[call-arg]