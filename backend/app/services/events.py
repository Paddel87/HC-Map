"""Event service: CRUD with RLS-aware ordering and the participant join."""

from __future__ import annotations

import uuid
from collections.abc import Sequence
from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.event import Event, EventParticipant
from app.models.person import Person
from app.schemas.event import EventCreate, EventStart, EventUpdate


async def list_events(
    session: AsyncSession,
    *,
    limit: int,
    offset: int,
) -> tuple[Sequence[Event], int]:
    """List events visible to the current request.

    RLS filtering happens automatically because the session was set up
    via ``get_rls_session`` (see ``app.deps``).
    """
    total = await session.scalar(select(func.count()).select_from(Event))
    rows = (
        (
            await session.execute(
                select(Event).order_by(Event.started_at.desc()).limit(limit).offset(offset)
            )
        )
        .scalars()
        .all()
    )
    return rows, int(total or 0)


async def create_event(
    session: AsyncSession,
    payload: EventCreate,
    *,
    created_by: uuid.UUID,
) -> Event:
    event = Event(
        started_at=payload.started_at,
        ended_at=payload.ended_at,
        lat=payload.lat,
        lon=payload.lon,
        reveal_participants=payload.reveal_participants,
        note=payload.note,
        w3w_legacy=payload.w3w_legacy,
        created_by=created_by,
    )
    session.add(event)
    await session.flush()
    await session.refresh(event)
    return event


async def get_event(session: AsyncSession, event_id: uuid.UUID) -> Event | None:
    return await session.get(Event, event_id)


async def update_event(
    session: AsyncSession,
    event: Event,
    payload: EventUpdate,
) -> Event:
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(event, field, value)
    await session.flush()
    await session.refresh(event)
    return event


async def delete_event(session: AsyncSession, event: Event) -> None:
    await session.delete(event)
    await session.flush()


async def start_event(
    session: AsyncSession,
    payload: EventStart,
    *,
    created_by: uuid.UUID,
    creator_person_id: uuid.UUID,
) -> Event:
    """Create a Live-mode event with ``started_at = now()`` (ADR-024 §B).

    The creator is implicitly added as a participant. If a recipient is
    supplied, it is added as a second participant so subsequent
    live-applications can default to it.
    """
    event = Event(
        started_at=datetime.now(tz=UTC),
        ended_at=None,
        lat=payload.lat,
        lon=payload.lon,
        reveal_participants=payload.reveal_participants,
        note=payload.note,
        created_by=created_by,
    )
    session.add(event)
    await session.flush()
    await session.refresh(event)

    await add_participant(session, event.id, creator_person_id)
    if payload.recipient_id and payload.recipient_id != creator_person_id:
        await add_participant(session, event.id, payload.recipient_id)
    return event


async def end_event(session: AsyncSession, event: Event) -> Event:
    """Set ``ended_at = now()`` if not already set (idempotent)."""
    if event.ended_at is None:
        event.ended_at = datetime.now(tz=UTC)
        await session.flush()
        await session.refresh(event)
    return event


async def list_participants(session: AsyncSession, event_id: uuid.UUID) -> Sequence[Person]:
    rows = (
        (
            await session.execute(
                select(Person)
                .join(EventParticipant, EventParticipant.person_id == Person.id)
                .where(EventParticipant.event_id == event_id)
                .order_by(Person.name)
            )
        )
        .scalars()
        .all()
    )
    return rows


async def add_participant(
    session: AsyncSession, event_id: uuid.UUID, person_id: uuid.UUID
) -> EventParticipant | None:
    """Insert participant link if not already present. Returns the row
    or ``None`` if it already existed."""
    existing = await session.get(EventParticipant, (event_id, person_id))
    if existing is not None:
        return None
    link = EventParticipant(event_id=event_id, person_id=person_id)
    session.add(link)
    await session.flush()
    return link


async def remove_participant(
    session: AsyncSession, event_id: uuid.UUID, person_id: uuid.UUID
) -> bool:
    link = await session.get(EventParticipant, (event_id, person_id))
    if link is None:
        return False
    await session.delete(link)
    await session.flush()
    return True
