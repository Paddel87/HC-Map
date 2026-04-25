"""Email backends (M2 stub).

The default implementation logs structured events instead of sending real
mail. SMTP/external-provider backends are added before M11 (Querschnitts-
aufgabe). PII handling: only the recipient address and the reset URL are
logged; tokens are otherwise treated as secrets.
"""

from __future__ import annotations

from typing import Protocol

import structlog

logger = structlog.get_logger(__name__)


class EmailBackend(Protocol):
    async def send_password_reset(self, email: str, token: str) -> None: ...

    async def send_verify(self, email: str, token: str) -> None: ...


class LoggingBackend:
    """Default M2 backend: writes the message to the structured log."""

    async def send_password_reset(self, email: str, token: str) -> None:
        logger.info(
            "auth.mail.password_reset",
            recipient=email,
            reset_url=f"https://app.example/reset?token={token}",
        )

    async def send_verify(self, email: str, token: str) -> None:
        logger.info(
            "auth.mail.verify",
            recipient=email,
            verify_url=f"https://app.example/verify?token={token}",
        )


def get_email_backend() -> EmailBackend:
    """FastAPI dependency for the active email backend."""
    return LoggingBackend()
