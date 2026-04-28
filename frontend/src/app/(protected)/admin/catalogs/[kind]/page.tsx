import { notFound } from "next/navigation";

import { CatalogListing } from "@/components/catalog/catalog-listing";
import { KindTabs } from "@/components/catalog/kind-tabs";
import {
  CATALOG_KINDS,
  CATALOG_KIND_LABELS,
  type CatalogKind,
} from "@/lib/catalog/types";

function isKnownKind(value: string): value is CatalogKind {
  return (CATALOG_KINDS as readonly string[]).includes(value);
}

export default async function CatalogKindPage({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  const { kind } = await params;
  if (!isKnownKind(kind)) notFound();
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Katalog-Verwaltung</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Aktive Ansicht: <strong>{CATALOG_KIND_LABELS[kind]}</strong>. Editoren sehen
          freigegebene Einträge plus eigene Vorschläge (offen oder abgelehnt mit
          Begründung). Anlegen und Workflow-Aktionen folgen mit M7.3 / M7.4.
        </p>
      </header>
      <KindTabs active={kind} />
      <CatalogListing kind={kind} />
    </div>
  );
}
