/**
 * Smoke tests for the /api/admin/* TanStack-Query hooks (M8.4, ADR-049).
 *
 * Covers the call-shapes that the components depend on - if any of
 * these drift the dashboard or user-creation pages break.
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  adminExportUrl,
  adminStatsQueryKey,
  adminUsersQueryKey,
  useAdminStats,
  useCreateAdminUser,
  useDeactivateAdminUser,
  useUpdateAdminUser,
} from "@/lib/admin/api";

function withQuery() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("admin api helpers", () => {
  it("buildt stable cache keys for stats and users (incl. filter variants)", () => {
    expect(adminStatsQueryKey()).toEqual(["admin", "stats"]);
    expect(adminUsersQueryKey()).toEqual([
      "admin",
      "users",
      { role: null, is_active: null, limit: null, offset: null },
    ]);
    expect(adminUsersQueryKey({ role: "editor", is_active: true })).toEqual([
      "admin",
      "users",
      { role: "editor", is_active: true, limit: null, offset: null },
    ]);
  });

  it("exposes a stable export URL", () => {
    expect(adminExportUrl()).toBe("/api/admin/export/all");
  });
});

describe("useAdminStats", () => {
  it("fetches /api/admin/stats and returns the body", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        events_total: 7,
        events_per_month_last_12: [],
        top_restraints: [],
        top_arm_positions: [],
        top_hand_positions: [],
        users_by_role: { admin: 1, editor: 2, viewer: 0 },
        persons_total: 3,
        persons_on_the_fly_unlinked: 0,
        pending_catalog_proposals: 0,
      }),
    );

    const { result } = renderHook(() => useAdminStats(), { wrapper: withQuery() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.events_total).toBe(7);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/api/admin/stats");
  });
});

describe("useCreateAdminUser", () => {
  it("POSTs to /api/admin/users with the JSON body", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        id: "u1",
        email: "x@y.de",
        role: "editor",
        is_active: true,
        is_verified: true,
        person_id: "p1",
        display_name: null,
        created_at: "2026-04-30T00:00:00Z",
      }),
    );

    const { result } = renderHook(() => useCreateAdminUser(), { wrapper: withQuery() });

    await result.current.mutateAsync({
      email: "x@y.de",
      password: "Twelvecharsmin",
      role: "editor",
      existing_person_id: "p1",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/api/admin/users");
    expect(init?.method).toBe("POST");
    const body = JSON.parse(init?.body as string);
    expect(body.email).toBe("x@y.de");
    expect(body.existing_person_id).toBe("p1");
  });
});

describe("useUpdateAdminUser / useDeactivateAdminUser", () => {
  it("PATCH /api/admin/users/{id} with the partial payload", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        id: "u1",
        email: "x@y.de",
        role: "admin",
        is_active: true,
        is_verified: true,
        person_id: "p1",
        display_name: null,
        created_at: "2026-04-30T00:00:00Z",
      }),
    );

    const { result } = renderHook(() => useUpdateAdminUser(), { wrapper: withQuery() });
    await result.current.mutateAsync({ id: "u1", payload: { role: "admin" } });

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/api/admin/users/u1");
    expect(init?.method).toBe("PATCH");
    expect(JSON.parse(init?.body as string)).toEqual({ role: "admin" });
  });

  it("DELETE /api/admin/users/{id}", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        id: "u1",
        email: "x@y.de",
        role: "viewer",
        is_active: false,
        is_verified: true,
        person_id: "p1",
        display_name: null,
        created_at: "2026-04-30T00:00:00Z",
      }),
    );
    const { result } = renderHook(() => useDeactivateAdminUser(), { wrapper: withQuery() });
    await result.current.mutateAsync("u1");
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/api/admin/users/u1");
    expect(init?.method).toBe("DELETE");
  });
});
