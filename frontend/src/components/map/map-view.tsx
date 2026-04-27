"use client";

/**
 * Full-screen MapView for the /map route (M6.2, ADR-041 §E/§F/§G).
 *
 * - Subscribes to the RxDB `events` collection live, filters by
 *   `_deleted=false` server-side (selector) and by valid lat/lon
 *   client-side via `selectMappableEvents`.
 * - Renders one `Marker` per event; clicking opens a `Popup` with date,
 *   coordinates and a link to the detail page. Person names stay out of
 *   the popup deliberately — the Persons collection is not synced via
 *   RxDB (ADR-037 keeps it server-only), so a reliable masking decision
 *   per ADR-038 §F isn't possible offline. Detail page enforces the
 *   masking rule.
 * - Clustering / filter / geocoding land in M6.3 / M6.4 / M6.5.
 */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Map, {
  Marker,
  NavigationControl,
  Popup,
  type MapRef,
} from "react-map-gl/maplibre";

import {
  DEFAULT_MAP_CENTER,
  rasterTileStyle,
  selectMappableEvents,
  type MappableEvent,
} from "@/lib/map";
import { useDatabase } from "@/lib/rxdb/provider";
import type { EventDocType } from "@/lib/rxdb/types";

const INITIAL_ZOOM = 11;

export function MapView() {
  const events = useEvents();
  const mapStyle = useMemo(() => rasterTileStyle(), []);
  const [activeId, setActiveId] = useState<string | null>(null);

  const active = useMemo(
    () => (activeId ? events.find((e) => e.id === activeId) ?? null : null),
    [activeId, events],
  );

  return (
    <div
      className="relative h-full w-full"
      style={{ height: "calc(100vh - 8rem)" }}
      data-testid="map-view"
    >
      <Map
        mapStyle={mapStyle}
        initialViewState={{
          latitude: DEFAULT_MAP_CENTER.lat,
          longitude: DEFAULT_MAP_CENTER.lon,
          zoom: INITIAL_ZOOM,
        }}
        ref={(_ref: MapRef | null) => {
          // Reserved for M6.5 (flyTo from geocoding search).
        }}
      >
        <NavigationControl position="top-right" showCompass={false} />
        {events.map((event) => (
          <Marker
            key={event.id}
            latitude={event.lat}
            longitude={event.lon}
            anchor="bottom"
            onClick={(domEvent) => {
              // react-map-gl propagates the click to the map by default
              // and would immediately close the popup we're about to
              // open — stop the propagation explicitly.
              domEvent.originalEvent.stopPropagation();
              setActiveId(event.id);
            }}
          >
            <button
              type="button"
              aria-label={`Event vom ${formatDate(event.started_at)}`}
              data-testid="map-event-marker"
              data-event-id={event.id}
              className="block h-7 w-7 -translate-y-1 rounded-full border-2 border-white bg-blue-600 shadow-md transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </Marker>
        ))}
        {active ? (
          <Popup
            latitude={active.lat}
            longitude={active.lon}
            anchor="bottom"
            offset={28}
            onClose={() => setActiveId(null)}
            closeOnClick={false}
            closeButton
          >
            <EventPopupContent event={active} />
          </Popup>
        ) : null}
      </Map>
      <MapStatusBar count={events.length} />
    </div>
  );
}

function EventPopupContent({ event }: { event: MappableEvent }) {
  const isLive = event.ended_at === null;
  return (
    <div className="flex flex-col gap-1 text-sm" data-testid="map-event-popup">
      <div className="font-medium">{formatDate(event.started_at)}</div>
      <div className="text-xs text-slate-600">
        {event.lat.toFixed(5)}, {event.lon.toFixed(5)}
      </div>
      <div className="text-xs">
        <span
          className={
            isLive
              ? "inline-flex items-center gap-1 font-medium text-emerald-700"
              : "inline-flex items-center gap-1 text-slate-600"
          }
        >
          <span
            className={
              isLive
                ? "inline-block h-2 w-2 rounded-full bg-emerald-500"
                : "inline-block h-2 w-2 rounded-full bg-slate-400"
            }
            aria-hidden
          />
          {isLive ? "läuft" : "beendet"}
        </span>
      </div>
      <Link
        href={`/events/${event.id}`}
        className="pt-1 text-xs font-medium text-blue-600 hover:underline"
        data-testid="map-event-popup-link"
      >
        Detailseite öffnen →
      </Link>
    </div>
  );
}

function MapStatusBar({ count }: { count: number }) {
  return (
    <div
      className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-1 text-xs text-slate-700 shadow-sm dark:bg-slate-900/90 dark:text-slate-200"
      data-testid="map-status-bar"
    >
      {count === 0
        ? "Keine sichtbaren Events"
        : `${count} Event${count === 1 ? "" : "s"} sichtbar`}
    </div>
  );
}

function useEvents(): MappableEvent[] {
  const database = useDatabase();
  const [docs, setDocs] = useState<EventDocType[]>([]);
  useEffect(() => {
    if (!database) return;
    const sub = database.events
      .find({
        selector: { _deleted: { $eq: false } },
      })
      .$.subscribe((rows) => setDocs(rows.map((r) => r.toJSON() as EventDocType)));
    return () => sub.unsubscribe();
  }, [database]);
  return useMemo(() => selectMappableEvents(docs), [docs]);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
