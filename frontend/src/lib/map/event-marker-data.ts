/**
 * Pure helpers for converting RxDB event docs into marker payloads
 * (M6.2, ADR-041 §F).
 *
 * Lives in `lib/map/` so the `MapView` shell stays a thin wrapper and
 * the filter / mapping logic is unit-testable without WebGL.
 */

import type { EventDocType } from "@/lib/rxdb/types";

export interface MappableEvent {
  id: string;
  lat: number;
  lon: number;
  started_at: string;
  ended_at: string | null;
  note: string | null;
  reveal_participants: boolean;
}

export function isMappableEvent(doc: EventDocType): boolean {
  if (doc._deleted) return false;
  const { lat, lon } = doc;
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return false;
  if (lat < -90 || lat > 90) return false;
  if (lon < -180 || lon > 180) return false;
  // (0, 0) is a valid coordinate (Null Island), but in this product
  // it almost always indicates a missing GPS fix that slipped through.
  // Keep it for now — backend validation already rejects truly missing
  // coordinates, and a real Null-Island Event can be filtered manually.
  return true;
}

export function selectMappableEvents(docs: readonly EventDocType[]): MappableEvent[] {
  const result: MappableEvent[] = [];
  for (const doc of docs) {
    if (!isMappableEvent(doc)) continue;
    result.push({
      id: doc.id,
      lat: doc.lat,
      lon: doc.lon,
      started_at: doc.started_at,
      ended_at: doc.ended_at,
      note: doc.note,
      reveal_participants: doc.reveal_participants,
    });
  }
  return result;
}
