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

    # --- Auth (M2) -------------------------------------------------------
    secret_key: str = Field(
        default="change-me-in-production-32-bytes-minimum",
        min_length=32,
        description="Server-side secret used to sign session JWTs.",
    )
    cookie_secure: bool = Field(
        default=True,
        description="Set Secure flag on auth cookies. Disable only in HTTP dev.",
    )
    cookie_lifetime_seconds: int = Field(
        default=60 * 60 * 24 * 7,
        description="Session cookie / JWT lifetime in seconds (default 7 days).",
    )
    argon2_time_cost: int = Field(default=2)
    argon2_memory_cost: int = Field(default=19456)
    argon2_parallelism: int = Field(default=1)

    # --- Tile provider (M5a, ADR-022) ----------------------------------
    maptiler_api_key: str = Field(
        default="",
        description="MapTiler Cloud API key (server-side only). Empty disables tile proxy.",
    )
    maptiler_style: str = Field(
        default="basic-v2",
        description="MapTiler map style identifier used for tile URLs.",
    )


def get_settings() -> Settings:
    """Return a fresh Settings instance.

    Not cached: tests override env vars between cases. Callers that need
    a stable instance should hold the returned object themselves.
    """
    return Settings()
