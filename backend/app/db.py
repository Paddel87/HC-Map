"""Async SQLAlchemy engine, session factory, and FastAPI dependency.

The engine is created lazily so tests can override the database URL via
the ``HCMAP_DATABASE_URL`` environment variable before first use. Sessions
are scoped per request; commit/rollback is the caller's responsibility
(no implicit commit on context exit).
"""

from __future__ import annotations

from collections.abc import AsyncIterator
from functools import lru_cache

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.config import get_settings


@lru_cache(maxsize=1)
def get_engine() -> AsyncEngine:
    """Return the process-wide async engine, creating it on first call."""
    settings = get_settings()
    return create_async_engine(
        settings.database_url,
        pool_pre_ping=True,
        future=True,
    )


@lru_cache(maxsize=1)
def get_sessionmaker() -> async_sessionmaker[AsyncSession]:
    return async_sessionmaker(
        bind=get_engine(),
        expire_on_commit=False,
        autoflush=False,
    )


async def get_session() -> AsyncIterator[AsyncSession]:
    """FastAPI dependency yielding an ``AsyncSession``.

    The session is closed on context exit. Errors are NOT swallowed; the
    caller is expected to commit or rollback explicitly.
    """
    sm = get_sessionmaker()
    async with sm() as session:
        yield session


def reset_engine_cache() -> None:
    """Clear cached engine/sessionmaker (test helper)."""
    get_engine.cache_clear()
    get_sessionmaker.cache_clear()
