"""Application configuration loaded from environment variables.

Single source of truth for runtime configuration. Loaded once at startup.
"""

from __future__ import annotations

from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime settings sourced from environment variables.

    Variable names follow the pattern HCMAP_<NAME>. Defaults are intentionally
    chosen to fail loudly in production (no implicit secrets, no implicit DB).
    """

    model_config = SettingsConfigDict(
        env_prefix="HCMAP_",
        env_file=None,
        case_sensitive=False,
        extra="ignore",
    )

    environment: Literal["development", "test", "production"] = "development"
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = "INFO"

    database_url: str = Field(
        default="postgresql+asyncpg://hcmap:hcmap@db:5432/hcmap",
        description="SQLAlchemy async DSN for Postgres+PostGIS.",
    )


def get_settings() -> Settings:
    """Return a fresh Settings instance.

    Not cached: tests override env vars between cases. Callers that need
    a stable instance should hold the returned object themselves.
    """
    return Settings()
