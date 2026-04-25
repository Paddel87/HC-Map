"""Export routes: JSON for personal data, CSV per entity (ADR-015, ADR-020 §J).

The admin export reuses ``/api/admin/export/all`` which streams the full
JSON; RLS still applies, but the admin-role policies make every row
visible.
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.deps import get_rls_session, require_role
from app.models.user import User, UserRole
from app.services import exports as exports_svc

router = APIRouter(tags=["export"])


@router.get(
    "/export/me",
    summary="JSON export of all data the current user can see",
)
async def export_me_json(
    session: AsyncSession = Depends(get_rls_session),
) -> dict[str, Any]:
    return await exports_svc.build_json_export(session)


@router.get(
    "/export/me/events.csv",
    response_class=StreamingResponse,
    summary="CSV export of visible events",
)
async def export_me_events_csv(
    session: AsyncSession = Depends(get_rls_session),
) -> StreamingResponse:
    return StreamingResponse(
        exports_svc.stream_events_csv(session),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=events.csv"},
    )


@router.get(
    "/export/me/applications.csv",
    response_class=StreamingResponse,
    summary="CSV export of visible applications",
)
async def export_me_applications_csv(
    session: AsyncSession = Depends(get_rls_session),
) -> StreamingResponse:
    return StreamingResponse(
        exports_svc.stream_applications_csv(session),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=applications.csv"},
    )


@router.get(
    "/admin/export/all",
    summary="Admin-only full JSON export (all rows; RLS as admin)",
)
async def admin_export_all(
    _admin: User = Depends(require_role(UserRole.ADMIN)),
    session: AsyncSession = Depends(get_rls_session),
) -> dict[str, Any]:
    return await exports_svc.build_json_export(session)
