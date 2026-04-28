import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Workflow-Aktionen folgen mit M8 (Freigabe-Queue, Personen-Merge, Anonymisierung).
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">SQLAdmin</CardTitle>
          <CardDescription>
            CRUD-Stammdatenpflege für alle Tabellen liegt unter
            <code className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">
              /admin
            </code>
            (SQLAdmin, ADR-016) und wird mit M8 aktiviert.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-slate-500 dark:text-slate-400">
          Diese Seite ist sichtbar, weil deine Rolle <code>admin</code> ist (RLS-konform).
        </CardContent>
      </Card>
    </div>
  );
}
