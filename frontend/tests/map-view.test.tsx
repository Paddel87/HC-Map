/**
 * Smoke coverage for `MapView` (M6.2, ADR-041 §E).
 *
 * `react-map-gl/maplibre` needs WebGL, which jsdom does not provide
 * (see ADR-027 §J2 for the same rationale on `LocationPickerMap`). The
 * map shell is mocked here so we can verify:
 *   - the RxDB subscription drives the marker count,
 *   - clicking a marker opens a popup with a link to the detail page,
 *   - the empty-state copy appears when no events are mappable.
 *
 * The data filter (`selectMappableEvents`) is covered separately in
 * `tests/event-marker-data.test.ts`.
 */

import "fake-indexeddb/auto";

import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { BehaviorSubject } from "rxjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { EventDocType } from "@/lib/rxdb/types";

interface MarkerProps {
  latitude: number;
  longitude: number;
  onClick?: (e: { originalEvent: { stopPropagation: () => void } }) => void;
  children: ReactNode;
}

interface PopupProps {
  latitude: number;
  longitude: number;
  onClose: () => void;
  children: ReactNode;
}

vi.mock("react-map-gl/maplibre", () => {
  return {
    default: ({ children }: { children: ReactNode }) => (
      <div data-testid="mock-map">{children}</div>
    ),
    Marker: ({ latitude, longitude, onClick, children }: MarkerProps) => (
      <div
        data-testid="mock-marker"
        data-lat={latitude}
        data-lon={longitude}
        onClick={() =>
          onClick?.({ originalEvent: { stopPropagation: () => {} } })
        }
      >
        {children}
      </div>
    ),
    Popup: ({ latitude, longitude, onClose, children }: PopupProps) => (
      <div data-testid="mock-popup" data-lat={latitude} data-lon={longitude}>
        <button
          type="button"
          aria-label="Popup schließen"
          data-testid="mock-popup-close"
          onClick={onClose}
        />
        {children}
      </div>
    ),
    NavigationControl: () => <div data-testid="mock-nav" />,
  };
});

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
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("MapView (M6.2)", () => {
  it("renders a marker per mappable event", () => {
    useDatabaseMock.mockReturnValue(
      makeDatabase([
        makeDoc({ id: "a", lat: 52.5, lon: 13.4 }),
        makeDoc({ id: "b", lat: 48.1, lon: 11.5 }),
        makeDoc({ id: "deleted", _deleted: true }),
        makeDoc({ id: "out-of-range", lat: 999 }),
      ]),
    );
    render(<MapView />);
    const markers = screen.getAllByTestId("map-event-marker");
    expect(markers).toHaveLength(2);
    expect(markers.map((m) => m.dataset.eventId)).toEqual(["a", "b"]);
  });

  it("shows the empty status when no events are mappable", () => {
    useDatabaseMock.mockReturnValue(makeDatabase([]));
    render(<MapView />);
    expect(screen.getByTestId("map-status-bar")).toHaveTextContent(
      "Keine sichtbaren Events",
    );
    expect(screen.queryByTestId("map-event-marker")).toBeNull();
  });

  it("handles a still-loading database (null) without throwing", () => {
    useDatabaseMock.mockReturnValue(null);
    render(<MapView />);
    expect(screen.getByTestId("map-view")).toBeInTheDocument();
    expect(screen.queryAllByTestId("map-event-marker")).toHaveLength(0);
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

  it("opens a popup with a detail link when a marker is clicked", () => {
    useDatabaseMock.mockReturnValue(
      makeDatabase([makeDoc({ id: "evt-1", lat: 50, lon: 10 })]),
    );
    render(<MapView />);
    expect(screen.queryByTestId("map-event-popup")).toBeNull();

    fireEvent.click(screen.getByTestId("map-event-marker"));

    const popup = screen.getByTestId("map-event-popup");
    expect(popup).toBeInTheDocument();
    const link = screen.getByTestId("map-event-popup-link");
    expect(link).toHaveAttribute("href", "/events/evt-1");
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
    fireEvent.click(screen.getByTestId("map-event-marker"));
    expect(screen.getByTestId("map-event-popup")).toHaveTextContent("beendet");
  });

  it("closes the popup when the close button is clicked", () => {
    useDatabaseMock.mockReturnValue(
      makeDatabase([makeDoc({ id: "evt-1" })]),
    );
    render(<MapView />);
    fireEvent.click(screen.getByTestId("map-event-marker"));
    expect(screen.getByTestId("map-event-popup")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("mock-popup-close"));
    expect(screen.queryByTestId("map-event-popup")).toBeNull();
  });
});
