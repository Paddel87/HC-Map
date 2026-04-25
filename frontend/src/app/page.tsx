import { cn } from "@/lib/cn";

export default function HomePage() {
  return (
    <main
      className={cn(
        "mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 px-6 py-12 text-center",
      )}
    >
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">HC-Map</h1>
      <p className="text-base text-slate-600 dark:text-slate-300">
        Self-hosted, geo-referenced event log. Setup is in progress (M0).
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Backend health endpoint:{" "}
        <code className="rounded bg-slate-100 px-2 py-1 font-mono text-xs dark:bg-slate-800">
          GET /api/health
        </code>
      </p>
    </main>
  );
}
