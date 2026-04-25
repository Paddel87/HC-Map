"""Shared pytest fixtures.

DB tests use a sync engine (psycopg) so session-scoped fixtures can be
shared across function-scoped tests without event-loop juggling. The
production app uses asyncpg; the schema is the same.

DSN resolution:
1. ``HCMAP_TEST_DATABASE_URL`` (preferred for CI / dev with local Postgres).
2. testcontainers ``postgis/postgis:16-3.4`` (skipped if Docker missing).
"""

from __future__ import annotations

import os
from collections.abc import AsyncIterator, Iterator

import pytest
from app.main import create_app
from httpx import ASGITransport, AsyncClient
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker


@pytest.fixture
async def client() -> AsyncIterator[AsyncClient]:
    """In-process AsyncClient bound to a fresh app instance."""
    app = create_app()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


# ---------------------------------------------------------------------------
# Database fixtures (sync; M1 schema tests don't need async)
# ---------------------------------------------------------------------------


def _to_sync_url(url: str) -> str:
    return url.replace("+asyncpg", "+psycopg") if "+asyncpg" in url else url


@pytest.fixture(scope="session")
def db_url() -> Iterator[str]:
    env_dsn = os.environ.get("HCMAP_TEST_DATABASE_URL")
    if env_dsn:
        yield _to_sync_url(env_dsn)
        return

    try:
        from testcontainers.postgres import PostgresContainer
    except ImportError:
        pytest.skip("HCMAP_TEST_DATABASE_URL not set and testcontainers not installed")
        return
    if not os.path.exists("/var/run/docker.sock"):
        pytest.skip("HCMAP_TEST_DATABASE_URL not set and Docker daemon is unreachable")
        return
    with PostgresContainer("postgis/postgis:16-3.4") as pg:
        sync_url = pg.get_connection_url()  # postgresql+psycopg2://...
        if "+psycopg2" in sync_url:
            sync_url = sync_url.replace("+psycopg2", "+psycopg")
        yield sync_url


@pytest.fixture(scope="session")
def db_engine(db_url: str) -> Iterator[Engine]:
    """Session-scoped sync engine. Migrates from scratch once per session."""
    from alembic import command
    from alembic.config import Config

    cfg = Config("alembic.ini")
    cfg.set_main_option("sqlalchemy.url", db_url)
    command.upgrade(cfg, "head")

    engine = create_engine(db_url, future=True)
    try:
        yield engine
    finally:
        engine.dispose()


@pytest.fixture
def db_session(db_engine: Engine) -> Iterator[Session]:
    """Function-scoped session. Each test runs inside a transaction that is
    rolled back on exit, so tests stay independent without dropping tables."""
    SessionLocal = sessionmaker(bind=db_engine, expire_on_commit=False, autoflush=False)
    conn = db_engine.connect()
    trans = conn.begin()
    sess = SessionLocal(bind=conn)
    try:
        yield sess
    finally:
        sess.close()
        # IntegrityError-aborted transactions are auto-deassociated;
        # rollback is harmless but emits a SAWarning. Guard it.
        if trans.is_active:
            trans.rollback()
        conn.close()
