"""fastapi-users ``UserManager`` and DB adapter.

Hashes passwords with Argon2id (parameters in ``app.config.Settings``).
Hooks ``on_after_*`` route the relevant tokens through ``EmailBackend`` so
the password-reset and verify flows are wired even with the M2 logging
stub.
"""

from __future__ import annotations

import secrets
import uuid
from collections.abc import AsyncIterator

from fastapi import Depends, Request
from fastapi_users import BaseUserManager, UUIDIDMixin
from fastapi_users.db import SQLAlchemyUserDatabase
from fastapi_users.password import PasswordHelper
from pwdlib import PasswordHash
from pwdlib.hashers.argon2 import Argon2Hasher
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.mail import EmailBackend, get_email_backend
from app.config import get_settings
from app.db import get_session
from app.models.user import User


def _password_helper() -> PasswordHelper:
    """Argon2id-only password helper using OWASP-recommended parameters."""
    settings = get_settings()
    hasher = PasswordHash(
        (
            Argon2Hasher(
                time_cost=settings.argon2_time_cost,
                memory_cost=settings.argon2_memory_cost,
                parallelism=settings.argon2_parallelism,
            ),
        )
    )
    return PasswordHelper(hasher)


class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):  # type: ignore[type-var]
    """Application UserManager.

    ``reset_password_token_secret`` and ``verification_token_secret`` are
    derived from the runtime SECRET_KEY so a key-rotation invalidates
    outstanding tokens.
    """

    def __init__(
        self,
        user_db: SQLAlchemyUserDatabase[User, uuid.UUID],  # type: ignore[type-var]
        email_backend: EmailBackend,
    ) -> None:
        password_helper = _password_helper()
        super().__init__(user_db, password_helper)
        self._email = email_backend
        secret = get_settings().secret_key
        self.reset_password_token_secret = secret
        self.verification_token_secret = secret

    async def on_after_forgot_password(
        self,
        user: User,
        token: str,
        request: Request | None = None,
    ) -> None:
        await self._email.send_password_reset(user.email, token)

    async def on_after_request_verify(
        self,
        user: User,
        token: str,
        request: Request | None = None,
    ) -> None:
        await self._email.send_verify(user.email, token)


async def get_user_db(
    session: AsyncSession = Depends(get_session),
) -> AsyncIterator[SQLAlchemyUserDatabase[User, uuid.UUID]]:  # type: ignore[type-var]
    yield SQLAlchemyUserDatabase(session, User)  # type: ignore[type-var]


async def get_user_manager(
    user_db: SQLAlchemyUserDatabase[User, uuid.UUID] = Depends(get_user_db),  # type: ignore[type-var]
    email_backend: EmailBackend = Depends(get_email_backend),
) -> AsyncIterator[UserManager]:
    yield UserManager(user_db, email_backend)


def generate_csrf_token() -> str:
    """Return a fresh URL-safe CSRF token (256 bits of entropy)."""
    return secrets.token_urlsafe(32)
