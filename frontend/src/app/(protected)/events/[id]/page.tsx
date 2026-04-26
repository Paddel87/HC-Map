import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { LiveEventView } from "@/components/event/live-event-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerMe } from "@/lib/auth-server";
import { coerceNumber, type EventDetail } from "@/lib/types";

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8000";

async function loadEvent(
  id: string,
  cookieHeader: string,
): Promise<EventDetail | null | "not-found"> {
  const response = await fetch(`${BACKEND_URL}/api/events/${id}`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });
  if (response.status === 404) return "not-found";
  if (response.status === 401) return null;
  if (!response.ok) return null;
  return (await response.json()) as EventDetail;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getServerMe();
  if (!user) redirect(`/login?next=/events/${id}`);

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const result = await loadEvent(id, cookieHeader);
  if (result === "not-found") notFound();
  if (!result) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Event</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Konnte nicht geladen werden.</p>
        </header>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Backend nicht erreichbar</CardTitle>
            <CardDescription>Bitte später erneut versuchen.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {result.ended_at === null ? "Live-Event" : "Event"}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Gestartet am {new Date(result.started_at).toLocaleString("de-DE")}
          {result.ended_at ? ` · beendet ${new Date(result.ended_at).toLocaleString("de-DE")}` : ""}
        </p>
      </header>
      {result.ended_at === null ? (
        <LiveEventView user={user} initialEvent={result} />
      ) : (
        <EndedEventView event={result} />
      )}
    </div>
  );
}

function EndedEventView({ event }: { event: EventDetail }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Event beendet</CardTitle>
        <CardDescription>
          Standort {coerceNumber(event.lat).toFixed(5)}, {coerceNumber(event.lon).toFixed(5)}
          {event.plus_code ? ` · Plus Code ${event.plus_code}` : ""}.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        <p>
          Die vollständige Detailansicht mit chronologischer Application-Liste und Lücken-Anzeige
          folgt mit M5c.
        </p>
        {event.note ? (
          <p className="italic text-slate-600 dark:text-slate-400">{event.note}</p>
        ) : null}
        <div>
          <Button asChild variant="secondary">
            <Link href="/">Zurück zum Dashboard</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
