"""FastAPI application entry point.

M0 scope: minimal app that exposes a health endpoint so deployment and
docker-compose wiring can be verified end-to-end. Domain routers are
mounted in later milestones.
"""

from __future__ import annotations

from fastapi import FastAPI
from pydantic import BaseModel

from app.config import get_settings
from app.logging import configure_logging


class HealthResponse(BaseModel):
    """Health probe payload."""

    status: str
    environment: str


def create_app() -> FastAPI:
    """Build and return the FastAPI application.

    Factory pattern keeps test setups isolated from import-time side effects.
    """
    settings = get_settings()
    configure_logging(
        level=settings.log_level,
        json_output=settings.environment != "development",
    )

    app = FastAPI(
        title="HC-Map API",
        version="0.0.0",
        docs_url="/api/docs",
        openapi_url="/api/openapi.json",
    )

    @app.get("/api/health", response_model=HealthResponse, tags=["meta"])
    async def health() -> HealthResponse:
        return HealthResponse(status="ok", environment=settings.environment)

    return app


app = create_app()
