"""User model.

Layout follows the fastapi-users SQLAlchemy adapter so M2 can plug it in
without schema changes. The mandatory 1:1 link to Person is enforced at
the database level (NOT NULL UNIQUE) per ADR-010.
"""

from __future__ import annotations

import enum
import uuid

from sqlalchemy import Enum, ForeignKey, Index, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, SoftDeleteMixin, TimestampMixin, pk_column


class UserRole(str, enum.Enum):
    """Application-level RBAC roles (architecture.md §RLS)."""

    ADMIN = "admin"
    EDITOR = "editor"
    VIEWER = "viewer"


class User(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "user"
    __table_args__ = (
        UniqueConstraint("email", name="uq_user_email"),
        UniqueConstraint("person_id", name="uq_user_person_id"),
        Index("ix_user_role", "role"),
    )

    id: Mapped[uuid.UUID] = pk_column()
    email: Mapped[str] = mapped_column(String(320), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(1024), nullable=False)
    is_active: Mapped[bool] = mapped_column(nullable=False, default=True, server_default="true")
    is_verified: Mapped[bool] = mapped_column(nullable=False, default=False, server_default="false")
    is_superuser: Mapped[bool] = mapped_column(
        nullable=False, default=False, server_default="false"
    )
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role", values_callable=lambda e: [m.value for m in e]),
        nullable=False,
    )
    person_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("person.id", ondelete="RESTRICT"),
        nullable=False,
    )
    display_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
