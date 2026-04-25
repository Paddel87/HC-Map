"""HTTP tests for the Events Live-mode endpoints (M5a.1)."""

from __future__ import annotations

from datetime import UTC, datetime

import pytest
from app.models.user import UserRole
from httpx import AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from tests.api_helpers import login_as, post_with_csrf


@pytest.fixture(autouse=True)
async def _clean(async_session_factory: async_sessionmaker[AsyncSession]):
    yield
    async with async_session_factory() as session, session.begin():
        await session.execute(text("DELETE FROM event_participant"))
        await session.execute(text("DELETE FROM application_restraint"))
        await session.execute(text("DELETE FROM application"))
        await session.execute(text("DELETE FROM event"))


async def _make_person(async_session_factory: async_sessionmaker[AsyncSession], name: str) -> str:
    from app.models.base import uuid7

    pid = uuid7()
    async with async_session_factory() as session, session.begin():
        await session.execute(
            text("INSERT INTO person (id, name) VALUES (:id, :n)"),
            {"id": pid, "n": name},
        )
    return str(pid)


async def test_start_event_assigns_started_at_now_and_no_ended_at(
    client: AsyncClient,
    async_session_factory: async_sessionmaker[AsyncSession],
) -> None:
    user, csrf = await login_as(client, async_session_factory, role=UserRole.ADMIN)
    before = datetime.now(tz=UTC)
    resp = await post_with_csrf(
        client,
        csrf,
        "/api/events/start",
        json={"lat": "52.520008", "lon": "13.404954"},
    )
    after = datetime.now(tz=UTC)
    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert body["ended_at"] is None
    started = datetime.fromisoformat(body["started_at"])
    assert before <= started <= after
    # Creator is automatically a participant.
    participant_ids = {p["id"] for p in body["participants"]}
    assert str(user.person_id) in participant_ids


async def test_start_event_with_recipient_adds_both_participants(
    client: AsyncClient,
    async_session_factory: async_sessionmaker[AsyncSession],
) -> None:
    user, csrf = await login_as(client, async_session_factory, role=UserRole.ADMIN)
    recipient_id = await _make_person(async_session_factory, "LiveRecipient")
    resp = await post_with_csrf(
        client,
        csrf,
        "/api/events/start",
        json={"lat": "0", "lon": "0", "recipient_id": recipient_id},
    )
    assert resp.status_code == 201, resp.text
    participant_ids = {p["id"] for p in resp.json()["participants"]}
    assert str(user.person_id) in participant_ids
    assert recipient_id in participant_ids


async def test_end_event_sets_ended_at(
    client: AsyncClient,
    async_session_factory: async_sessionmaker[AsyncSession],
) -> None:
    _, csrf = await login_as(client, async_session_factory, role=UserRole.ADMIN)
    start = await post_with_csrf(
        client,
        csrf,
        "/api/events/start",
        json={"lat": "0", "lon": "0"},
    )
    event_id = start.json()["id"]
    end = await post_with_csrf(client, csrf, f"/api/events/{event_id}/end")
    assert end.status_code == 200, end.text
    assert end.json()["ended_at"] is not None


async def test_end_event_idempotent(
    client: AsyncClient,
    async_session_factory: async_sessionmaker[AsyncSession],
) -> None:
    """A second end call must not advance ``ended_at``."""
    _, csrf = await login_as(client, async_session_factory, role=UserRole.ADMIN)
    start = await post_with_csrf(
        client,
        csrf,
        "/api/events/start",
        json={"lat": "0", "lon": "0"},
    )
    event_id = start.json()["id"]
    first = await post_with_csrf(client, csrf, f"/api/events/{event_id}/end")
    second = await post_with_csrf(client, csrf, f"/api/events/{event_id}/end")
    assert first.status_code == 200
    assert second.status_code == 200
    assert first.json()["ended_at"] == second.json()["ended_at"]


async def test_end_event_unknown_id_returns_404(
    client: AsyncClient,
    async_session_factory: async_sessionmaker[AsyncSession],
) -> None:
    _, csrf = await login_as(client, async_session_factory, role=UserRole.ADMIN)
    resp = await post_with_csrf(
        client,
        csrf,
        "/api/events/00000000-0000-0000-0000-000000000000/end",
    )
    assert resp.status_code == 404
