import os
from typing import List, Optional
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App General
    APP_NAME: str = "CLUDE Engine"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = Field(default="development", env="ENVIRONMENT")
    DEBUG: bool = Field(default=True, env="DEBUG")
    SECRET_KEY: str = Field(default="dev_secret_key_change_in_production_32bytesmin", env="SECRET_KEY")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # Database & pgvector
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://clude_user:clude_password@localhost:5432/clude_db",
        env="DATABASE_URL"
    )
    DATABASE_SYNC_URL: Optional[str] = Field(
        default="postgresql://clude_user:clude_password@localhost:5432/clude_db",
        env="DATABASE_SYNC_URL"
    )

    # Redis & Task Queues
    REDIS_URL: str = Field(default="redis://localhost:6379/0", env="REDIS_URL")
    CELERY_BROKER_URL: str = Field(default="redis://localhost:6379/1", env="CELERY_BROKER_URL")
    CELERY_RESULT_BACKEND: str = Field(default="redis://localhost:6379/2", env="CELERY_RESULT_BACKEND")

    # LLM & Embedding Providers
    OPENAI_API_KEY: Optional[str] = Field(default=None, env="OPENAI_API_KEY")
    ANTHROPIC_API_KEY: Optional[str] = Field(default=None, env="ANTHROPIC_API_KEY")
    PRIMARY_LLM_PROVIDER: str = Field(default="anthropic", env="PRIMARY_LLM_PROVIDER")
    EMBEDDING_MODEL: str = Field(default="text-embedding-3-large", env="EMBEDDING_MODEL")
    EMBEDDING_DIMENSION: int = 1536
    REASONING_MODEL: str = Field(default="claude-3-5-sonnet-20241022", env="REASONING_MODEL")

    # GitHub OAuth & Webhooks
    GITHUB_CLIENT_ID: Optional[str] = Field(default=None, env="GITHUB_CLIENT_ID")
    GITHUB_CLIENT_SECRET: Optional[str] = Field(default=None, env="GITHUB_CLIENT_SECRET")
    GITHUB_WEBHOOK_SECRET: Optional[str] = Field(default=None, env="GITHUB_WEBHOOK_SECRET")
    GITHUB_REDIRECT_URI: str = Field(default="http://localhost:3000/api/auth/callback/github", env="GITHUB_REDIRECT_URI")

    # CORS & Security
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    RATE_LIMIT_PER_MINUTE: int = 60

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
