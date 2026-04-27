"use client";

/**
 * Full-screen MapView for the /map route (M6.2 / M6.3, ADR-041
 * §C/§E/§F/§G).
 *
 * - Subscribes to the RxDB `events` collection live, filters by
 *   `_deleted=false` server-side (selector) and by valid lat/lon
 *   client-side via `selectMappableEvents`.
 * - Renders events through a single GeoJSON `Source` with native
 *   MapLibre clustering (`cluster: true`). Three layers stack on it:
 *   `clusters` (filled circle), `cluster-count` (count text),
 *   `unclustered-point` (single-event circle). No `supercluster`
 *   dependency — the architecture choice is documented in ADR-041 §C.
 * - Click on a cluster zooms in via `getClusterExpansionZoom` and
 *   `easeTo`. Click on an unclustered point opens the popup.
 * - Filter / geocoding land in M6.4 / M6.5.
 */

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, {
  Layer,
  NavigationControl,
  Popup,
  Source,
  type LayerProps,
  type MapLayerMouseEvent,
  type MapRef,
} from "react-map-gl/maplibre";

import {
  DEFAULT_MAP_CENTER,
  eventsToGeoJSON,
  rasterTileStyle,
  selectMappableEvents,
  type MappableEvent,
} from "@/lib/map";
import { useDatabase } from "@/lib/rxdb/provider";
import type { EventDocType } from "@/lib/rxdb/types";

const INITIAL_ZOOM = 11;
const SOURCE_ID = "events";
const CLUSTER_LAYER_ID = "events-clusters";
const CLUSTER_COUNT_LAYER_ID = "events-cluster-count";
const UNCLUSTERED_LAYER_ID = "events-unclustered";

const clusterLayer: LayerProps = {
  id: CLUSTER_LAYER_ID,
  type: "circle",
  source: SOURCE_ID,
  filter: ["has", "point_count"],
  paint: {
    // Step expression: small (≤9), medium (10–29), large (30+).
    "circle-color": [
      "step",
      ["get", "point_count"],
      "#3b82f6",
      10,
      "#2563eb",
      30,
      "#1d4ed8",
    ],
    "circle-radius": [
      "step",
      ["get", "point_count"],
      18,
      10,
      24,
      30,
      30,
    ],
    "circle-stroke-color": "#ffffff",
    "circle-stroke-width": 2,
  },
};

const clusterCountLayer: LayerProps = {
  id: CLUSTER_COUNT_LAYER_ID,
  type: "symbol",
  source: SOURCE_ID,
  filter: ["has", "point_count"],
  layout: {
    "text-field": ["get", "point_count_abbreviated"],
    "text-size": 12,
    "text-allow-overlap": true,
  },
  paint: {
    "text-color": "#ffffff",
  },
};

const unclusteredLayer: LayerProps = {
  id: UNCLUSTERED_LAYER_ID,
  type: "circle",
  source: SOURCE_ID,
  filter: ["!", ["has", "point_count"]],
  paint: {
    "circle-color": "#2563eb",
    "circle-radius": 8,
    "circle-stroke-color": "#ffffff",
    "circle-stroke-width": 2,
  },
};

const interactiveLayerIds = [CLUSTER_LAYER_ID, UNCLUSTERED_LAYER_ID];

export function MapView() {
  const events = useEvents();
  const mapStyle = useMemo(() => rasterTileStyle(), []);
  const geojson = useMemo(() => eventsToGeoJSON(events), [events]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const mapRef = useRef<MapRef | null>(null);

  const active = useMemo(
    () => (activeId ? events.find((e) => e.id === activeId) ?? null : null),
    [activeId, events],
  );

  const handleMapClick = useCallback((event: MapLayerMouseEvent) => {
    const feature = event.features?.[0];
    if (!feature) return;
    const layerId =
      (feature.layer as { id?: string } | undefined)?.id ?? null;
    if (layerId === CLUSTER_LAYER_ID) {
      const props = feature.properties as
        | { cluster_id?: number }
        | null
        | undefined;
      const clusterId = props?.cluster_id;
      const map = event.target;
      if (typeof clusterId !== "number" || !map) return;
      const source = map.getSource(SOURCE_ID) as
        | {
            getClusterExpansionZoom?: (
              id: number,
            ) => Promise<number> | undefined;
          }
        | null
        | undefined;
      const promise = source?.getClusterExpansionZoom?.(clusterId);
      if (!promise) return;
      const geom = feature.geometry as
        | { type: string; coordinates?: [number, number] }
        | undefined;
      const center = geom?.coordinates ?? null;
      promise
        .then((zoom: number) => {
          if (!center) return;
          map.easeTo({ center, zoom });
        })
        .catch(() => {
          /* swallow upstream errors — UX falls back to manual zoom */
        });
      return;
    }
    if (layerId === UNCLUSTERED_LAYER_ID) {
      const props = feature.properties as { id?: string } | null | undefined;
      const id = props?.id;
      if (typeof id === "string") setActiveId(id);
    }
  }, []);

  return (
    <div
      className="relative h-full w-full"
      style={{ height: "calc(100vh - 8rem)" }}
      data-testid="map-view"
    >
      <Map
        ref={mapRef}
        mapStyle={mapStyle}
        initialViewState={{
          latitude: DEFAULT_MAP_CENTER.lat,
          longitude: DEFAULT_MAP_CENTER.lon,
          zoom: INITIAL_ZOOM,
        }}
        interactiveLayerIds={interactiveLayerIds}
        onClick={handleMapClick}
        cursor="auto"
      >
        <NavigationControl position="top-right" showCompass={false} />
        <Source
          id={SOURCE_ID}
          type="geojson"
          data={geojson}
          cluster
          clusterRadius={50}
          clusterMaxZoom={14}
        >
          <Layer {...clusterLayer} />
          <Layer {...clusterCountLayer} />
          <Layer {...unclusteredLayer} />
        </Source>
        {active ? (
          <Popup
            latitude={active.lat}
            longitude={active.lon}
            anchor="bottom"
            offset={16}
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
