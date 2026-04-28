"use client";

import { StatusBadge } from "@/components/catalog/status-badge";
import {
  entryLabel,
  isRestraintTypeEntry,
  MECHANICAL_TYPE_LABELS,
  RESTRAINT_CATEGORY_LABELS,
  type AnyCatalogEntry,
  type CatalogKind,
} from "@/lib/catalog/types";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function metaSubtitle(entry: AnyCatalogEntry): string | null {
  if (!isRestraintTypeEntry(entry)) {
    return entry.description;
  }
  const parts: string[] = [RESTRAINT_CATEGORY_LABELS[entry.category]];
  if (entry.brand) parts.push(entry.brand);
  if (entry.model) parts.push(entry.model);
  if (entry.mechanical_type) parts.push(MECHANICAL_TYPE_LABELS[entry.mechanical_type]);
  return parts.join(" · ");
}

export function CatalogTable({
  entries,
  kind: _kind,
  isLoading,
  emptyHint,
}: {
  entries: AnyCatalogEntry[];
  kind: CatalogKind;
  isLoading: boolean;
  emptyHint: string;
}) {
  if (isLoading) {
    return (
      <div
        role="status"
        aria-label="Lade Katalog-Einträge"
        className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
      >
        Lade …
      </div>
    );
  }
  if (entries.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
        {emptyHint}
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          <tr>
            <th scope="col" className="px-4 py-2 font-medium">
              Bezeichnung
            </th>
            <th scope="col" className="px-4 py-2 font-medium">
              Status
            </th>
            <th scope="col" className="hidden px-4 py-2 font-medium md:table-cell">
              Erstellt
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {entries.map((entry) => {
            const subtitle = metaSubtitle(entry);
            return (
              <tr
                key={entry.id}
                data-testid="catalog-row"
                data-entry-id={entry.id}
                data-status={entry.status}
                className="hover:bg-slate-50 dark:hover:bg-slate-900/40"
              >
                <td className="px-4 py-3 align-top">
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    {entryLabel(entry)}
                  </div>
                  {subtitle ? (
                    <div className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</div>
                  ) : null}
                  {entry.status === "rejected" && entry.reject_reason ? (
                    <div className="mt-1 text-xs text-rose-700 dark:text-rose-300">
                      Begründung: {entry.reject_reason}
                    </div>
                  ) : null}
                </td>
                <td className="px-4 py-3 align-top">
                  <StatusBadge status={entry.status} />
                </td>
                <td className="hidden px-4 py-3 align-top text-xs text-slate-500 md:table-cell dark:text-slate-400">
                  {formatDate(entry.created_at)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
