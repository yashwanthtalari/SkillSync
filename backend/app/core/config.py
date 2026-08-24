import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="ignore")

    PROJECT_NAME: str = "Skill2Pocket"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "skill2pocket_super_secret_jwt_key_2026_change_in_prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database: Supports PostgreSQL (Supabase / local) and SQLite fallback
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite+aiosqlite:///./skill2pocket.db"
    )

    # Supabase (Optional)
    SUPABASE_URL: Optional[str] = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: Optional[str] = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

    # AI Configuration
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "fallback") # ollama, openai, fallback
    AI_BASE_URL: str = os.getenv("AI_BASE_URL", "http://localhost:11434")
    AI_API_KEY: str = os.getenv("AI_API_KEY", "")
    AI_MODEL: str = os.getenv("AI_MODEL", "llama3")

settings = Settings()
