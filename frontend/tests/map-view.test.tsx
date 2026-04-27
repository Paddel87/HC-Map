/**
 * Smoke coverage for `MapView` (M6.2 / M6.3, ADR-041 §C/§E).
 *
 * `react-map-gl/maplibre` needs WebGL, which jsdom does not provide
 * (see ADR-027 §J2 for the same rationale on `LocationPickerMap`).
 * The map shell, `Source`, `Layer` and `Popup` are mocked so we can
 * verify:
 *   - the GeoJSON `Source` is configured for clustering and gets
 *     exactly one feature per mappable event,
 *   - clicking an unclustered point opens a popup with a link to the
 *     detail page,
 *   - clicking a cluster zooms in via `getClusterExpansionZoom` +
 *     `easeTo`,
 *   - the empty-state copy appears when no events are mappable.
 *
 * The data filter (`selectMappableEvents`) and the GeoJSON builder
 * (`eventsToGeoJSON`) are covered separately in
 * `tests/event-marker-data.test.ts`.
 */

import "fake-indexeddb/auto";

import { fireEvent, render, screen } from "@testing-library/react";
import { act } from "react";
import type { ReactNode } from "react";
import { BehaviorSubject } from "rxjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { MappableEventCollection } from "@/lib/map";
import type { EventDocType } from "@/lib/rxdb/types";

interface MapMockProps {
  children: ReactNode;
  onClick?: (event: FakeMapMouseEvent) => void;
  interactiveLayerIds?: string[];
}

interface FakeFeature {
  layer?: { id?: string };
  properties?: Record<string, unknown>;
  geometry?: { type: string; coordinates?: [number, number] };
}

interface FakeMapTarget {
  getSource?: (id: string) => unknown;
  easeTo?: (opts: { center: [number, number]; zoom: number }) => void;
}

interface FakeMapMouseEvent {
  features?: FakeFeature[];
  target?: FakeMapTarget;
}

interface SourceMockProps {
  id: string;
  data: MappableEventCollection;
  cluster?: boolean;
  clusterRadius?: number;
  clusterMaxZoom?: number;
  children: ReactNode;
}

interface LayerMockProps {
  id: string;
}

interface PopupMockProps {
  latitude: number;
  longitude: number;
  onClose: () => void;
  children: ReactNode;
}

let mapProps: MapMockProps | null = null;
let sourceProps: SourceMockProps | null = null;
let layerProps: LayerMockProps[] = [];

vi.mock("react-map-gl/maplibre", () => ({
  default: (props: MapMockProps) => {
    mapProps = props;
    return <div data-testid="mock-map">{props.children}</div>;
  },
  Source: (props: SourceMockProps) => {
    sourceProps = props;
    return (
      <div
        data-testid="mock-source"
        data-cluster={String(props.cluster ?? false)}
        data-feature-count={props.data.features.length}
      >
        {props.children}
      </div>
    );
  },
  Layer: (props: LayerMockProps) => {
    layerProps.push(props);
    return <div data-testid="mock-layer" data-layer-id={props.id} />;
  },
  Popup: ({ latitude, longitude, onClose, children }: PopupMockProps) => (
    <div
      data-testid="mock-popup"
      data-lat={latitude}
      data-lon={longitude}
    >
      <button
        type="button"
        data-testid="mock-popup-close"
        onClick={onClose}
      />
      {children}
    </div>
  ),
  NavigationControl: () => <div data-testid="mock-nav" />,
}));

const useDatabaseMock = vi.fn();

vi.mock("@/lib/rxdb/provider", () => ({
  useDatabase: () => useDatabaseMock(),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import { MapView } from "@/components/map/map-view";

function makeDoc(overrides: Partial<EventDocType>): EventDocType {
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

interface FakeDatabase {
  events: {
    find: () => { $: BehaviorSubject<{ toJSON: () => EventDocType }[]> };
  };
}

function makeDatabase(docs: EventDocType[]): FakeDatabase {
  const subject = new BehaviorSubject<{ toJSON: () => EventDocType }[]>(
    docs.map((d) => ({ toJSON: () => d })),
  );
  return {
    events: { find: () => ({ $: subject }) },
  };
}

beforeEach(() => {
  useDatabaseMock.mockReset();
  mapProps = null;
  sourceProps = null;
  layerProps = [];
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("MapView (M6.2 / M6.3)", () => {
  it("registers cluster, count and unclustered layers on the events source", () => {
    useDatabaseMock.mockReturnValue(makeDatabase([makeDoc({ id: "a" })]));
    render(<MapView />);

    expect(sourceProps?.id).toBe("events");
    expect(sourceProps?.cluster).toBe(true);
    expect(sourceProps?.clusterRadius).toBe(50);
    expect(sourceProps?.clusterMaxZoom).toBe(14);

    const ids = layerProps.map((l) => l.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        "events-clusters",
        "events-cluster-count",
        "events-unclustered",
      ]),
    );
    expect(mapProps?.interactiveLayerIds).toEqual(
      expect.arrayContaining(["events-clusters", "events-unclustered"]),
    );
  });

  it("emits one GeoJSON feature per mappable event", () => {
    useDatabaseMock.mockReturnValue(
      makeDatabase([
        makeDoc({ id: "a", lat: 52.5, lon: 13.4 }),
        makeDoc({ id: "b", lat: 48.1, lon: 11.5 }),
        makeDoc({ id: "deleted", _deleted: true }),
        makeDoc({ id: "out-of-range", lat: 999 }),
      ]),
    );
    render(<MapView />);
    expect(sourceProps?.data.features.map((f) => f.properties.id)).toEqual([
      "a",
      "b",
    ]);
  });

  it("shows the empty status when no events are mappable", () => {
    useDatabaseMock.mockReturnValue(makeDatabase([]));
    render(<MapView />);
    expect(screen.getByTestId("map-status-bar")).toHaveTextContent(
      "Keine sichtbaren Events",
    );
    expect(sourceProps?.data.features).toHaveLength(0);
  });

  it("handles a still-loading database (null) without throwing", () => {
    useDatabaseMock.mockReturnValue(null);
    render(<MapView />);
    expect(screen.getByTestId("map-view")).toBeInTheDocument();
    expect(sourceProps?.data.features).toHaveLength(0);
  });

  it("reports the event count in the status bar (singular)", () => {
    useDatabaseMock.mockReturnValue(
      makeDatabase([makeDoc({ id: "only" })]),
    );
    render(<MapView />);
    expect(screen.getByTestId("map-status-bar")).toHaveTextContent(
      "1 Event sichtbar",
    );
  });

  it("reports the event count in the status bar (plural)", () => {
    useDatabaseMock.mockReturnValue(
      makeDatabase([
        makeDoc({ id: "a" }),
        makeDoc({ id: "b", lat: 48.1, lon: 11.5 }),
      ]),
    );
    render(<MapView />);
    expect(screen.getByTestId("map-status-bar")).toHaveTextContent(
      "2 Events sichtbar",
    );
  });

  it("opens a popup with a detail link when an unclustered point is clicked", () => {
    useDatabaseMock.mockReturnValue(
      makeDatabase([makeDoc({ id: "evt-1", lat: 50, lon: 10 })]),
    );
    render(<MapView />);
    expect(screen.queryByTestId("map-event-popup")).toBeNull();

    act(() => {
      mapProps?.onClick?.({
        features: [
          {
            layer: { id: "events-unclustered" },
            properties: { id: "evt-1" },
            geometry: { type: "Point", coordinates: [10, 50] },
          },
        ],
        target: {},
      });
    });

    const popup = screen.getByTestId("map-event-popup");
    expect(popup).toBeInTheDocument();
    expect(screen.getByTestId("map-event-popup-link")).toHaveAttribute(
      "href",
      "/events/evt-1",
    );
    expect(popup).toHaveTextContent("läuft");
  });

  it("marks ended events as 'beendet' in the popup", () => {
    useDatabaseMock.mockReturnValue(
      makeDatabase([
        makeDoc({
          id: "ended",
          ended_at: "2026-04-27T13:00:00Z",
        }),
      ]),
    );
    render(<MapView />);
    act(() => {
      mapProps?.onClick?.({
        features: [
          {
            layer: { id: "events-unclustered" },
            properties: { id: "ended" },
            geometry: { type: "Point", coordinates: [13.405, 52.52] },
          },
        ],
        target: {},
      });
    });
    expect(screen.getByTestId("map-event-popup")).toHaveTextContent("beendet");
  });

  it("zooms into a cluster on click via getClusterExpansionZoom + easeTo", async () => {
    useDatabaseMock.mockReturnValue(
      makeDatabase([
        makeDoc({ id: "a", lat: 52.5, lon: 13.4 }),
        makeDoc({ id: "b", lat: 52.51, lon: 13.41 }),
      ]),
    );
    render(<MapView />);

    const easeTo = vi.fn();
    const getClusterExpansionZoom = vi.fn().mockResolvedValue(16);
    const target: FakeMapTarget = {
      easeTo,
      getSource: () => ({ getClusterExpansionZoom }),
    };

    await act(async () => {
      mapProps?.onClick?.({
        features: [
          {
            layer: { id: "events-clusters" },
            properties: { cluster_id: 42 },
            geometry: { type: "Point", coordinates: [13.405, 52.505] },
          },
        ],
        target,
      });
      // Allow the awaited promise to resolve.
      await Promise.resolve();
    });

    expect(getClusterExpansionZoom).toHaveBeenCalledWith(42);
    expect(easeTo).toHaveBeenCalledWith({
      center: [13.405, 52.505],
      zoom: 16,
    });
    // Cluster click must NOT open a popup.
    expect(screen.queryByTestId("map-event-popup")).toBeNull();
  });

  it("ignores clicks on non-interactive features", () => {
    useDatabaseMock.mockReturnValue(
      makeDatabase([makeDoc({ id: "evt-1" })]),
    );
    render(<MapView />);
    act(() => {
      mapProps?.onClick?.({
        features: [],
        target: {},
      });
    });
    expect(screen.queryByTestId("map-event-popup")).toBeNull();
  });

  it("closes the popup when the close button is clicked", () => {
    useDatabaseMock.mockReturnValue(
      makeDatabase([makeDoc({ id: "evt-1" })]),
    );
    render(<MapView />);
    act(() => {
      mapProps?.onClick?.({
        features: [
          {
            layer: { id: "events-unclustered" },
            properties: { id: "evt-1" },
            geometry: { type: "Point", coordinates: [13.405, 52.52] },
          },
        ],
        target: {},
      });
    });
    expect(screen.getByTestId("map-event-popup")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("mock-popup-close"));
    expect(screen.queryByTestId("map-event-popup")).toBeNull();
  });
});
