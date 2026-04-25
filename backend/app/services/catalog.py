"""Catalog service: list, propose, approve for the four catalog tables."""

from __future__ import annotations

import uuid
from collections.abc import Sequence
from datetime import UTC, datetime
from typing import Any, TypeVar

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.catalog import (
    ArmPosition,
    CatalogStatus,
    HandOrientation,
    HandPosition,
    RestraintType,
)

CatalogModel = TypeVar("CatalogModel", ArmPosition, HandPosition, HandOrientation, RestraintType)


async def list_lookup(
    session: AsyncSession,
    model: type[CatalogModel],
    *,
    limit: int,
    offset: int,
) -> tuple[Sequence[CatalogModel], int]:
    """List approved entries (and own pendings via RLS).

    The strict per-role catalog policy from migration ``20260425_1730``
    handles approved/pending visibility automatically.
    """
    total = await session.scalar(select(func.count()).select_from(model))
    rows = (
        (
            await session.execute(
                select(model).order_by(model.created_at).limit(limit).offset(offset)
            )
        )
        .scalars()
        .all()
    )
    return rows, int(total or 0)


async def propose_lookup(
    session: AsyncSession,
    model: type[ArmPosition] | type[HandPosition] | type[HandOrientation],
    *,
    name: str,
    description: str | None,
    suggested_by: uuid.UUID,
) -> ArmPosition | HandPosition | HandOrientation:
    entry = model(
        name=name,
        description=description,
        status=CatalogStatus.PENDING,
        suggested_by=suggested_by,
    )
    session.add(entry)
    await session.flush()
    await session.refresh(entry)
    return entry


async def propose_restraint_type(
    session: AsyncSession,
    *,
    payload: dict[str, Any],
    suggested_by: uuid.UUID,
) -> RestraintType:
    entry = RestraintType(
        category=payload["category"],
        brand=payload.get("brand"),
        model=payload.get("model"),
        mechanical_type=payload.get("mechanical_type"),
        display_name=payload["display_name"],
        note=payload.get("note"),
        status=CatalogStatus.PENDING,
        suggested_by=suggested_by,
    )
    session.add(entry)
    await session.flush()
    await session.refresh(entry)
    return entry


async def approve_entry(
    session: AsyncSession,
    entry: CatalogModel,
    *,
    approved_by: uuid.UUID,
) -> CatalogModel:
    entry.status = CatalogStatus.APPROVED
    entry.approved_by = approved_by
    entry.updated_at = datetime.now(tz=UTC)
    await session.flush()
    await session.refresh(entry)
    return entry
