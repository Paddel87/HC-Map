"use client";

/**
 * TanStack-Query hooks for the four catalog tables (M7.2 ff.).
 *
 * Cache-Key shape: `["catalog", kind, { status }]` — invalidate via
 * `queryClient.invalidateQueries({ queryKey: ["catalog", kind] })` to
 * cover both filtered and unfiltered lists in one call.
 */

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import type { Page } from "@/lib/types";

import type { AnyCatalogEntry, CatalogKind, CatalogStatus } from "./types";

export interface CatalogListParams {
  status?: CatalogStatus;
  limit?: number;
  offset?: number;
}

export function catalogQueryKey(kind: CatalogKind, params: CatalogListParams = {}) {
  const { status, limit, offset } = params;
  return ["catalog", kind, { status: status ?? null, limit: limit ?? null, offset: offset ?? null }] as const;
}

export async function fetchCatalogPage(
  kind: CatalogKind,
  params: CatalogListParams = {},
): Promise<Page<AnyCatalogEntry>> {
  return await apiFetch<Page<AnyCatalogEntry>>(`/api/${kind}`, {
    query: {
      status: params.status,
      limit: params.limit,
      offset: params.offset,
    },
  });
}

/**
 * Lists catalog entries. Backend RLS already filters by role
 * (admin = all, editor = approved + own pending/rejected, viewer =
 * approved). The optional `status` query narrows further.
 */
export function useCatalogList(kind: CatalogKind, params: CatalogListParams = {}) {
  return useQuery({
    queryKey: catalogQueryKey(kind, params),
    queryFn: () => fetchCatalogPage(kind, params),
    staleTime: 5 * 60 * 1000,
  });
}
