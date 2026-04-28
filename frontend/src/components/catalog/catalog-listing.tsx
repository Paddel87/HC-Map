"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { CatalogTable } from "@/components/catalog/catalog-table";
import { StatusFilter, type StatusFilterValue } from "@/components/catalog/status-filter";
import { Button } from "@/components/ui/button";
import { useCatalogList } from "@/lib/catalog/api";
import {
  CATALOG_KIND_LABELS,
  STATUS_LABELS,
  type CatalogKind,
  type CatalogStatus,
} from "@/lib/catalog/types";

/** Read the `status` URL query param and coerce to a known value. */
export function parseStatusParam(raw: string | null): StatusFilterValue {
  if (raw === "approved" || raw === "pending" || raw === "rejected") return raw;
  return "all";
}

function emptyHint(kind: CatalogKind, status: StatusFilterValue): string {
  const kindLabel = CATALOG_KIND_LABELS[kind];
  if (status === "all") return `Keine Einträge in „${kindLabel}".`;
  return `Keine Einträge mit Status „${STATUS_LABELS[status as CatalogStatus]}" in „${kindLabel}".`;
}

export function CatalogListing({
  kind,
  isAdmin,
}: {
  kind: CatalogKind;
  /** Toggles edit-link rendering and the create-button label.
   *  `false` is the editor view: button submits a proposal. */
  isAdmin: boolean;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const status = parseStatusParam(params.get("status"));

  const queryStatus = status === "all" ? undefined : status;
  const query = useCatalogList(kind, { status: queryStatus });

  const handleChange = useCallback(
    (next: StatusFilterValue) => {
      const url = new URL(window.location.href);
      if (next === "all") {
        url.searchParams.delete("status");
      } else {
        url.searchParams.set("status", next);
      }
      router.replace(`${url.pathname}${url.search}`, { scroll: false });
    },
    [router],
  );

  const entries = useMemo(() => query.data?.items ?? [], [query.data]);

  return (
    <section className="flex flex-col gap-3" aria-label="Katalog-Einträge">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <StatusFilter value={status} onChange={handleChange} />
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {query.isLoading ? "" : `${query.data?.total ?? 0} Einträge`}
          </span>
          <Button asChild size="sm">
            <Link href={`/admin/catalogs/${kind}/new`}>
              {isAdmin ? "Neuer Eintrag" : "Neuen Vorschlag einreichen"}
            </Link>
          </Button>
        </div>
      </div>
      {query.isError ? (
        <div
          role="alert"
          className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200"
        >
          Konnte Katalog nicht laden.
        </div>
      ) : (
        <CatalogTable
          entries={entries}
          kind={kind}
          isLoading={query.isLoading}
          emptyHint={emptyHint(kind, status)}
          canEdit={isAdmin}
        />
      )}
    </section>
  );
}
