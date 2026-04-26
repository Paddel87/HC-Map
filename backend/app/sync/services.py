"""Sync service: pull cursor queries and push conflict resolution.

Pull
====

``GET /api/sync/{collection}/pull`` walks the rows in
``(updated_at, id)`` order using the composite cursor index introduced
in M5b.1. Soft-deleted rows are returned with ``_deleted = true`` so
the client can drop them locally. RLS filters the result to what the
caller is allowed to see — tombstones included, because they remain
linked via ``event_participant`` until physical deletion.

Push
====

``POST /api/sync/{collection}/push`` accepts RxDB push entries
``[{assumedMasterState, newDocumentState}, ...]`` and applies the
per-field conflict-resolution rules from ADR-029:

* **immutable-after-create:** id, started_at, lat, lon, w3w_legacy,
  created_by, created_at, event_id, sequence_no. Any mismatch between
  the existing row and ``newDocumentState`` raises a conflict.
* **first-write-wins:** ended_at. Once the server holds a non-null
  value, a different non-null push is a conflict.
* **last-write-wins:** note, reveal_participants, performer/recipient,
  position FKs, ``_deleted`` (false → true only).
* **server-authoritative:** updated_at, geom, sequence_no on insert,
  created_by/created_at on insert.

Restore (``_deleted`` true → false) is rejected for non-admin callers
per ADR-029.
"""

from __future__ import annotations

import uuid
from collections.abc import Sequence
from datetime import UTC, datetime
from decimal import Decimal

from sqlalchemy import and_, func, or_, select
from sqlalchemy.exc import IntegrityError, ProgrammingError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.application import Application
from app.models.catalog import (
    ArmPosition,
    CatalogStatus,
    HandOrientation,
    HandPosition,
)
from app.models.event import Event, EventParticipant
from app.models.user import User, UserRole
from app.sync.schemas import (
    ApplicationDoc,
    ApplicationPullResponse,
    ApplicationPushItem,
    EventDoc,
    EventPullResponse,
    EventPushItem,
    SyncCheckpoint,
)

# ---------------------------------------------------------------------------
# Pull
# ---------------------------------------------------------------------------


async def pull_events(
    session: AsyncSession,
    *,
    checkpoint: SyncCheckpoint | None,
    limit: int,
) -> EventPullResponse:
    """Return events with ``(updated_at, id) > checkpoint`` (or all initially)."""
    stmt = select(Event)
    if checkpoint is not None:
        # Composite cursor comparison written out instead of tuple_(...) to keep
        # mypy + SQLAlchemy typing happy; functionally equivalent.
        stmt = stmt.where(
            or_(
                Event.updated_at > checkpoint.updated_at,
                and_(
                    Event.updated_at == checkpoint.updated_at,
                    Event.id > checkpoint.id,
                ),
            )
        )
    stmt = stmt.order_by(Event.updated_at, Event.id).limit(limit)
    rows = list((await session.execute(stmt)).scalars().all())
    docs = [_event_to_doc(r) for r in rows]
    new_cp: SyncCheckpoint | None
    if rows:
        last = rows[-1]
        new_cp = SyncCheckpoint(updated_at=last.updated_at, id=last.id)
    else:
        new_cp = checkpoint
    return EventPullResponse(documents=docs, checkpoint=new_cp)


async def pull_applications(
    session: AsyncSession,
    *,
    checkpoint: SyncCheckpoint | None,
    limit: int,
) -> ApplicationPullResponse:
    stmt = select(Application)
    if checkpoint is not None:
        stmt = stmt.where(
            or_(
                Application.updated_at > checkpoint.updated_at,
                and_(
                    Application.updated_at == checkpoint.updated_at,
                    Application.id > checkpoint.id,
                ),
            )
        )
    stmt = stmt.order_by(Application.updated_at, Application.id).limit(limit)
    rows = list((await session.execute(stmt)).scalars().all())
    docs = [_application_to_doc(r) for r in rows]
    new_cp: SyncCheckpoint | None
    if rows:
        last = rows[-1]
        new_cp = SyncCheckpoint(updated_at=last.updated_at, id=last.id)
    else:
        new_cp = checkpoint
    return ApplicationPullResponse(documents=docs, checkpoint=new_cp)


# ---------------------------------------------------------------------------
# Push: events
# ---------------------------------------------------------------------------


async def push_events(
    session: AsyncSession,
    items: Sequence[EventPushItem],
    *,
    user: User,
) -> list[EventDoc]:
    """Apply each push item; collect conflicts as server-side master docs."""
    conflicts: list[EventDoc] = []
    for item in items:
        new_doc = item.new_document_state
        existing = await session.get(Event, new_doc.id)

        # Mismatched expectations.
        if existing is not None and item.assumed_master_state is None:
            conflicts.append(_event_to_doc(existing))
            continue
        if existing is None and item.assumed_master_state is not None:
            conflicts.append(_synthetic_event_tombstone(new_doc.id))
            continue

        if existing is None:
            inserted = await _insert_event_or_conflict(session, new_doc, user)
            if inserted is None:
                # Insert failed (RLS / FK / unique). Surface as a tombstone so
                # the client stops retrying this exact id.
                conflicts.append(_synthetic_event_tombstone(new_doc.id))
            continue

        # Update path.
        conflict = _check_event_update(existing, new_doc, user.role)
        if conflict is not None:
            conflicts.append(conflict)
            continue
        _apply_event_update(existing, new_doc)
        try:
            async with session.begin_nested():
                await session.flush()
        except (IntegrityError, ProgrammingError):
            # Savepoint already rolled back; outer TX still alive. The local
            # ORM state is dirty but we abandon this item.
            await session.refresh(existing)
            conflicts.append(_event_to_doc(existing))

    return conflicts


async def _insert_event_or_conflict(
    session: AsyncSession,
    new_doc: EventDoc,
    user: User,
) -> Event | None:
    event = Event(
        id=new_doc.id,
        started_at=new_doc.started_at,
        ended_at=new_doc.ended_at,
        lat=Decimal(str(new_doc.lat)),
        lon=Decimal(str(new_doc.lon)),
        w3w_legacy=new_doc.w3w_legacy,
        reveal_participants=new_doc.reveal_participants,
        note=new_doc.note,
        created_by=user.id,
        is_deleted=new_doc.deleted,
        deleted_at=new_doc.deleted_at if new_doc.deleted else None,
    )
    try:
        async with session.begin_nested():
            session.add(event)
            await session.flush()
    except (IntegrityError, ProgrammingError):
        return None
    await session.refresh(event)
    # Auto-participant: creator's person record.
    await _ensure_participant(session, event.id, user.person_id)
    return event


def _check_event_update(
    existing: Event,
    new_doc: EventDoc,
    role: UserRole,
) -> EventDoc | None:
    """Return the server master doc as a conflict, or None to proceed."""
    # Immutable-after-create.
    if (
        existing.started_at != new_doc.started_at
        or float(existing.lat) != new_doc.lat
        or float(existing.lon) != new_doc.lon
        or existing.w3w_legacy != new_doc.w3w_legacy
        or existing.created_by != new_doc.created_by
    ):
        return _event_to_doc(existing)
    # First-write-wins on ended_at.
    if (
        existing.ended_at is not None
        and new_doc.ended_at is not None
        and existing.ended_at != new_doc.ended_at
    ):
        return _event_to_doc(existing)
    # Restore (true → false) only by admin.
    if existing.is_deleted and not new_doc.deleted and role != UserRole.ADMIN:
        return _event_to_doc(existing)
    return None


def _apply_event_update(existing: Event, new_doc: EventDoc) -> None:
    # FWW: only set ended_at if server didn't have one.
    if existing.ended_at is None and new_doc.ended_at is not None:
        existing.ended_at = new_doc.ended_at
    # LWW.
    existing.note = new_doc.note
    existing.reveal_participants = new_doc.reveal_participants
    # Soft-delete flip.
    if new_doc.deleted and not existing.is_deleted:
        existing.is_deleted = True
        existing.deleted_at = new_doc.deleted_at or datetime.now(tz=UTC)
    elif not new_doc.deleted and existing.is_deleted:
        # Admin restore (other roles already rejected upstream).
        existing.is_deleted = False
        existing.deleted_at = None


# ---------------------------------------------------------------------------
# Push: applications
# ---------------------------------------------------------------------------


async def push_applications(
    session: AsyncSession,
    items: Sequence[ApplicationPushItem],
    *,
    user: User,
) -> list[ApplicationDoc]:
    conflicts: list[ApplicationDoc] = []
    for item in items:
        new_doc = item.new_document_state
        existing = await session.get(Application, new_doc.id)

        if existing is not None and item.assumed_master_state is None:
            conflicts.append(_application_to_doc(existing))
            continue
        if existing is None and item.assumed_master_state is not None:
            conflicts.append(_synthetic_application_tombstone(new_doc.id, new_doc.event_id))
            continue

        if existing is None:
            inserted = await _insert_application_or_conflict(session, new_doc, user)
            if inserted is None:
                conflicts.append(
                    _synthetic_application_tombstone(new_doc.id, new_doc.event_id)
                )
            continue

        # Update path.
        conflict = _check_application_update(existing, new_doc, user.role)
        if conflict is not None:
            conflicts.append(conflict)
            continue
        _apply_application_update(existing, new_doc)
        try:
            async with session.begin_nested():
                await session.flush()
        except (IntegrityError, ProgrammingError):
            await session.refresh(existing)
            conflicts.append(_application_to_doc(existing))

    return conflicts


async def _insert_application_or_conflict(
    session: AsyncSession,
    new_doc: ApplicationDoc,
    user: User,
) -> Application | None:
    # Catalog refs must be approved (admins exempt).
    if user.role != UserRole.ADMIN:
        if new_doc.arm_position_id is not None:
            ap = await session.get(ArmPosition, new_doc.arm_position_id)
            if ap is None or ap.status != CatalogStatus.APPROVED:
                return None
        if new_doc.hand_position_id is not None:
            hp = await session.get(HandPosition, new_doc.hand_position_id)
            if hp is None or hp.status != CatalogStatus.APPROVED:
                return None
        if new_doc.hand_orientation_id is not None:
            ho = await session.get(HandOrientation, new_doc.hand_orientation_id)
            if ho is None or ho.status != CatalogStatus.APPROVED:
                return None

    # Server-authoritative sequence_no.
    next_seq = await _next_sequence_no(session, new_doc.event_id)

    application = Application(
        id=new_doc.id,
        event_id=new_doc.event_id,
        performer_id=new_doc.performer_id,
        recipient_id=new_doc.recipient_id,
        arm_position_id=new_doc.arm_position_id,
        hand_position_id=new_doc.hand_position_id,
        hand_orientation_id=new_doc.hand_orientation_id,
        sequence_no=next_seq,
        started_at=new_doc.started_at,
        ended_at=new_doc.ended_at,
        note=new_doc.note,
        created_by=user.id,
        is_deleted=new_doc.deleted,
        deleted_at=new_doc.deleted_at if new_doc.deleted else None,
    )
    try:
        async with session.begin_nested():
            session.add(application)
            await session.flush()
    except (IntegrityError, ProgrammingError):
        return None
    await session.refresh(application)

    # Auto-Participant (ADR-012).
    await _ensure_participant(session, new_doc.event_id, new_doc.performer_id)
    if new_doc.recipient_id != new_doc.performer_id:
        await _ensure_participant(session, new_doc.event_id, new_doc.recipient_id)
    return application


def _check_application_update(
    existing: Application,
    new_doc: ApplicationDoc,
    role: UserRole,
) -> ApplicationDoc | None:
    if (
        existing.event_id != new_doc.event_id
        or existing.sequence_no != new_doc.sequence_no
        or existing.started_at != new_doc.started_at
        or existing.created_by != new_doc.created_by
    ):
        return _application_to_doc(existing)
    if (
        existing.ended_at is not None
        and new_doc.ended_at is not None
        and existing.ended_at != new_doc.ended_at
    ):
        return _application_to_doc(existing)
    if existing.is_deleted and not new_doc.deleted and role != UserRole.ADMIN:
        return _application_to_doc(existing)
    return None


def _apply_application_update(
    existing: Application,
    new_doc: ApplicationDoc,
) -> None:
    if existing.ended_at is None and new_doc.ended_at is not None:
        existing.ended_at = new_doc.ended_at
    existing.performer_id = new_doc.performer_id
    existing.recipient_id = new_doc.recipient_id
    existing.arm_position_id = new_doc.arm_position_id
    existing.hand_position_id = new_doc.hand_position_id
    existing.hand_orientation_id = new_doc.hand_orientation_id
    existing.note = new_doc.note
    if new_doc.deleted and not existing.is_deleted:
        existing.is_deleted = True
        existing.deleted_at = new_doc.deleted_at or datetime.now(tz=UTC)
    elif not new_doc.deleted and existing.is_deleted:
        existing.is_deleted = False
        existing.deleted_at = None


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


async def _next_sequence_no(session: AsyncSession, event_id: uuid.UUID) -> int:
    current = await session.scalar(
        select(func.max(Application.sequence_no)).where(Application.event_id == event_id)
    )
    return int(current or 0) + 1


async def _ensure_participant(
    session: AsyncSession,
    event_id: uuid.UUID,
    person_id: uuid.UUID,
) -> None:
    existing = await session.get(EventParticipant, (event_id, person_id))
    if existing is not None:
        return
    try:
        async with session.begin_nested():
            session.add(EventParticipant(event_id=event_id, person_id=person_id))
            await session.flush()
    except (IntegrityError, ProgrammingError):
        # Race: another push inserted the same link. Savepoint already
        # rolled back; outer transaction is intact.
        pass


def _event_to_doc(row: Event) -> EventDoc:
    return EventDoc(
        id=row.id,
        started_at=row.started_at,
        ended_at=row.ended_at,
        lat=float(row.lat),
        lon=float(row.lon),
        w3w_legacy=row.w3w_legacy,
        reveal_participants=row.reveal_participants,
        note=row.note,
        created_by=row.created_by,
        created_at=row.created_at,
        updated_at=row.updated_at,
        deleted_at=row.deleted_at,
        deleted=row.is_deleted,
    )


def _application_to_doc(row: Application) -> ApplicationDoc:
    return ApplicationDoc(
        id=row.id,
        event_id=row.event_id,
        performer_id=row.performer_id,
        recipient_id=row.recipient_id,
        arm_position_id=row.arm_position_id,
        hand_position_id=row.hand_position_id,
        hand_orientation_id=row.hand_orientation_id,
        sequence_no=row.sequence_no,
        started_at=row.started_at,
        ended_at=row.ended_at,
        note=row.note,
        created_by=row.created_by,
        created_at=row.created_at,
        updated_at=row.updated_at,
        deleted_at=row.deleted_at,
        deleted=row.is_deleted,
    )


def _synthetic_event_tombstone(event_id: uuid.UUID) -> EventDoc:
    """RxDB needs a master-doc shape even when the row is gone — fake a tombstone."""
    now = datetime.now(tz=UTC)
    return EventDoc(
        id=event_id,
        started_at=now,
        ended_at=None,
        lat=0.0,
        lon=0.0,
        w3w_legacy=None,
        reveal_participants=False,
        note=None,
        created_by=None,
        created_at=now,
        updated_at=now,
        deleted_at=now,
        deleted=True,
    )


def _synthetic_application_tombstone(
    application_id: uuid.UUID,
    event_id: uuid.UUID,
) -> ApplicationDoc:
    now = datetime.now(tz=UTC)
    return ApplicationDoc(
        id=application_id,
        event_id=event_id,
        performer_id=uuid.UUID(int=0),
        recipient_id=uuid.UUID(int=0),
        sequence_no=1,
        started_at=None,
        ended_at=None,
        note=None,
        created_by=None,
        created_at=now,
        updated_at=now,
        deleted_at=now,
        deleted=True,
    )
