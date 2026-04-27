/**
 * Pure-function coverage for the marker-data filter (M6.2, ADR-041 §F).
 *
 * `selectMappableEvents` decides which RxDB event docs are renderable
 * on the map. The MapLibre wrapper code is exercised in
 * `tests/map-view.test.tsx` via mocks; this suite owns the offline
 * filter logic so it can stay deterministic and WebGL-free.
 */

import { describe, expect, it } from "vitest";

import {
  isMappableEvent,
  selectMappableEvents,
} from "@/lib/map/event-marker-data";
import type { EventDocType } from "@/lib/rxdb/types";

function makeDoc(overrides: Partial<EventDocType> = {}): EventDocType {
  return {
    id: "evt-1",
    started_at: "2026-04-27T12:00:00Z",
    ended_at: null,
    lat: 52.52,
    lon: 13.405,
    w3w_legacy: null,
    reveal_participants: false,
    note: null,
    created_by: null,
    created_at: "2026-04-27T12:00:00Z",
    updated_at: "2026-04-27T12:00:00Z",
    deleted_at: null,
    _deleted: false,
    ...overrides,
  };
}

describe("isMappableEvent", () => {
  it("accepts a valid event", () => {
    expect(isMappableEvent(makeDoc())).toBe(true);
  });

  it("rejects soft-deleted events", () => {
    expect(isMappableEvent(makeDoc({ _deleted: true }))).toBe(false);
  });

  it("rejects out-of-range latitude", () => {
    expect(isMappableEvent(makeDoc({ lat: 95 }))).toBe(false);
    expect(isMappableEvent(makeDoc({ lat: -91 }))).toBe(false);
  });

  it("rejects out-of-range longitude", () => {
    expect(isMappableEvent(makeDoc({ lon: 181 }))).toBe(false);
    expect(isMappableEvent(makeDoc({ lon: -181 }))).toBe(false);
  });

  it("rejects non-finite coordinates", () => {
    expect(isMappableEvent(makeDoc({ lat: Number.NaN }))).toBe(false);
    expect(isMappableEvent(makeDoc({ lon: Number.POSITIVE_INFINITY }))).toBe(false);
  });

  it("accepts boundary values exactly", () => {
    expect(isMappableEvent(makeDoc({ lat: 90, lon: 180 }))).toBe(true);
    expect(isMappableEvent(makeDoc({ lat: -90, lon: -180 }))).toBe(true);
  });
});

describe("selectMappableEvents", () => {
  it("returns an empty array for an empty input", () => {
    expect(selectMappableEvents([])).toEqual([]);
  });

  it("filters out soft-deleted and invalid coordinates", () => {
    const docs = [
      makeDoc({ id: "ok-1" }),
      makeDoc({ id: "deleted", _deleted: true }),
      makeDoc({ id: "bad-lat", lat: 200 }),
      makeDoc({ id: "ok-2", lat: 48.137, lon: 11.575 }),
    ];
    const result = selectMappableEvents(docs);
    expect(result.map((e) => e.id)).toEqual(["ok-1", "ok-2"]);
  });

  it("projects only the fields needed by the map UI", () => {
    const result = selectMappableEvents([
      makeDoc({
        id: "evt-1",
        started_at: "2026-04-27T12:00:00Z",
        ended_at: "2026-04-27T13:00:00Z",
        note: "hello",
        reveal_participants: true,
        lat: 1.5,
        lon: 2.5,
      }),
    ]);
    expect(result).toEqual([
      {
        id: "evt-1",
        lat: 1.5,
        lon: 2.5,
        started_at: "2026-04-27T12:00:00Z",
        ended_at: "2026-04-27T13:00:00Z",
        note: "hello",
        reveal_participants: true,
      },
    ]);
  });

  it("preserves input order", () => {
    const docs = [
      makeDoc({ id: "c", lat: 50 }),
      makeDoc({ id: "a", lat: 51 }),
      makeDoc({ id: "b", lat: 52 }),
    ];
    expect(selectMappableEvents(docs).map((e) => e.id)).toEqual(["c", "a", "b"]);
  });
});
