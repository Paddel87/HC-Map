"""Catalog routes: 4 lookup tables (admin CRUD + propose/approve)."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.deps import get_rls_session, require_role
from app.models.catalog import (
    ArmPosition,
    HandOrientation,
    HandPosition,
    RestraintType,
)
from app.models.user import User, UserRole
from app.schemas.catalog import (
    ArmPositionCreate,
    ArmPositionRead,
    HandOrientationCreate,
    HandOrientationRead,
    HandPositionCreate,
    HandPositionRead,
    RestraintTypeCreate,
    RestraintTypeRead,
)
from app.schemas.common import Page
from app.services import catalog as catalog_svc

# --- ArmPosition ----------------------------------------------------------

arm_positions_router = APIRouter(prefix="/arm-positions", tags=["arm-positions"])


@arm_positions_router.get("", response_model=Page[ArmPositionRead])
async def list_arm_positions(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    session: AsyncSession = Depends(get_rls_session),
) -> Page[ArmPositionRead]:
    rows, total = await catalog_svc.list_lookup(session, ArmPosition, limit=limit, offset=offset)
    return Page[ArmPositionRead](
        items=[ArmPositionRead.model_validate(r) for r in rows],
        total=total,
        limit=limit,
        offset=offset,
    )


@arm_positions_router.post("", response_model=ArmPositionRead, status_code=status.HTTP_201_CREATED)
async def propose_arm_position(
    payload: ArmPositionCreate,
    user: User = Depends(require_role(UserRole.ADMIN, UserRole.EDITOR)),
    session: AsyncSession = Depends(get_rls_session),
) -> ArmPositionRead:
    entry = await catalog_svc.propose_lookup(
        session,
        ArmPosition,
        name=payload.name,
        description=payload.description,
        suggested_by=user.id,
    )
    return ArmPositionRead.model_validate(entry)


@arm_positions_router.post("/{entry_id}/approve", response_model=ArmPositionRead)
async def approve_arm_position(
    entry_id: uuid.UUID,
    user: User = Depends(require_role(UserRole.ADMIN)),
    session: AsyncSession = Depends(get_rls_session),
) -> ArmPositionRead:
    entry = await session.get(ArmPosition, entry_id)
    if entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    await catalog_svc.approve_entry(session, entry, approved_by=user.id)
    return ArmPositionRead.model_validate(entry)


# --- HandPosition ---------------------------------------------------------

hand_positions_router = APIRouter(prefix="/hand-positions", tags=["hand-positions"])


@hand_positions_router.get("", response_model=Page[HandPositionRead])
async def list_hand_positions(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    session: AsyncSession = Depends(get_rls_session),
) -> Page[HandPositionRead]:
    rows, total = await catalog_svc.list_lookup(session, HandPosition, limit=limit, offset=offset)
    return Page[HandPositionRead](
        items=[HandPositionRead.model_validate(r) for r in rows],
        total=total,
        limit=limit,
        offset=offset,
    )


@hand_positions_router.post(
    "", response_model=HandPositionRead, status_code=status.HTTP_201_CREATED
)
async def propose_hand_position(
    payload: HandPositionCreate,
    user: User = Depends(require_role(UserRole.ADMIN, UserRole.EDITOR)),
    session: AsyncSession = Depends(get_rls_session),
) -> HandPositionRead:
    entry = await catalog_svc.propose_lookup(
        session,
        HandPosition,
        name=payload.name,
        description=payload.description,
        suggested_by=user.id,
    )
    return HandPositionRead.model_validate(entry)


@hand_positions_router.post("/{entry_id}/approve", response_model=HandPositionRead)
async def approve_hand_position(
    entry_id: uuid.UUID,
    user: User = Depends(require_role(UserRole.ADMIN)),
    session: AsyncSession = Depends(get_rls_session),
) -> HandPositionRead:
    entry = await session.get(HandPosition, entry_id)
    if entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    await catalog_svc.approve_entry(session, entry, approved_by=user.id)
    return HandPositionRead.model_validate(entry)


# --- HandOrientation ------------------------------------------------------

hand_orientations_router = APIRouter(prefix="/hand-orientations", tags=["hand-orientations"])


@hand_orientations_router.get("", response_model=Page[HandOrientationRead])
async def list_hand_orientations(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    session: AsyncSession = Depends(get_rls_session),
) -> Page[HandOrientationRead]:
    rows, total = await catalog_svc.list_lookup(
        session, HandOrientation, limit=limit, offset=offset
    )
    return Page[HandOrientationRead](
        items=[HandOrientationRead.model_validate(r) for r in rows],
        total=total,
        limit=limit,
        offset=offset,
    )


@hand_orientations_router.post(
    "", response_model=HandOrientationRead, status_code=status.HTTP_201_CREATED
)
async def propose_hand_orientation(
    payload: HandOrientationCreate,
    user: User = Depends(require_role(UserRole.ADMIN, UserRole.EDITOR)),
    session: AsyncSession = Depends(get_rls_session),
) -> HandOrientationRead:
    entry = await catalog_svc.propose_lookup(
        session,
        HandOrientation,
        name=payload.name,
        description=payload.description,
        suggested_by=user.id,
    )
    return HandOrientationRead.model_validate(entry)


@hand_orientations_router.post("/{entry_id}/approve", response_model=HandOrientationRead)
async def approve_hand_orientation(
    entry_id: uuid.UUID,
    user: User = Depends(require_role(UserRole.ADMIN)),
    session: AsyncSession = Depends(get_rls_session),
) -> HandOrientationRead:
    entry = await session.get(HandOrientation, entry_id)
    if entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    await catalog_svc.approve_entry(session, entry, approved_by=user.id)
    return HandOrientationRead.model_validate(entry)


# --- RestraintType (richer fields) ----------------------------------------

restraint_types_router = APIRouter(prefix="/restraint-types", tags=["restraint-types"])


@restraint_types_router.get("", response_model=Page[RestraintTypeRead])
async def list_restraint_types(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    session: AsyncSession = Depends(get_rls_session),
) -> Page[RestraintTypeRead]:
    rows, total = await catalog_svc.list_lookup(session, RestraintType, limit=limit, offset=offset)
    return Page[RestraintTypeRead](
        items=[RestraintTypeRead.model_validate(r) for r in rows],
        total=total,
        limit=limit,
        offset=offset,
    )


@restraint_types_router.post(
    "", response_model=RestraintTypeRead, status_code=status.HTTP_201_CREATED
)
async def propose_restraint_type(
    payload: RestraintTypeCreate,
    user: User = Depends(require_role(UserRole.ADMIN, UserRole.EDITOR)),
    session: AsyncSession = Depends(get_rls_session),
) -> RestraintTypeRead:
    entry = await catalog_svc.propose_restraint_type(
        session, payload=payload.model_dump(), suggested_by=user.id
    )
    return RestraintTypeRead.model_validate(entry)


@restraint_types_router.post("/{entry_id}/approve", response_model=RestraintTypeRead)
async def approve_restraint_type(
    entry_id: uuid.UUID,
    user: User = Depends(require_role(UserRole.ADMIN)),
    session: AsyncSession = Depends(get_rls_session),
) -> RestraintTypeRead:
    entry = await session.get(RestraintType, entry_id)
    if entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    await catalog_svc.approve_entry(session, entry, approved_by=user.id)
    return RestraintTypeRead.model_validate(entry)
