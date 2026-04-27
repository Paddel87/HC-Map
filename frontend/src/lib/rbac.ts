/**
 * Role-based access checks for the M5c.4 edit pathway (ADR-040 §B).
 *
 * Pure functions — usable in both the `EventDetailView`'s
 * conditional Edit-button render and the server-side redirect on
 * `/events/[id]/edit/page.tsx`. Centralising the rule in one helper
 * keeps the two enforcement points consistent.
 */

import type { UserRole } from "./auth";

export interface RbacUser {
  id: string;
  role: UserRole;
}

export interface RbacEvent {
  /** Owner of the event (User-id, not Person-id). May be `null` for
   *  legacy or system-created events. */
  created_by: string | null;
}

/**
 * `true` when the user may edit the event.
 *
 * - Admin: always.
 * - Editor: only if `event.created_by === user.id`.
 * - Viewer (and anonymous): never.
 *
 * Mirrors the RLS-policy combination from migration
 * `20260425_1730_strict_rls` + the M5b.2 owner-select layer; the
 * frontend gate is a UX hint only, the backend RLS still has the
 * final say.
 */
export function canEditEvent(user: RbacUser, event: RbacEvent): boolean {
  if (user.role === "admin") return true;
  if (user.role === "editor") {
    return Boolean(event.created_by) && event.created_by === user.id;
  }
  return false;
}
