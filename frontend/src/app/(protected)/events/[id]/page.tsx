"use client";

/**
 * Event detail page — client-only render (M5c.1a, ADR-036).
 *
 * Replaces the previous Server Component that called `getServerMe()` and
 * SSR-fetched the event before any HTML left the server. The
 * client-only flow:
 *
 *  1. `useMe()` (TanStack Query) gives us the user; we redirect to
 *     `/login?next=...` if anonymous.
 *  2. `useEventDoc(id)` subscribes to RxDB so live updates flow into the
 *     page reactively (matches the M5b.3 read path).
 *  3. `useEventDetailFetch(id)` does ONE REST GET for `plus_code` and
 *     `participants` — these don't live in RxDB yet (M5c.1b will move
 *     participants into a sync collection).
 *  4. The render decision tree — see ADR-036 §H — combines both signals:
 *     - both still loading → skeleton
 *     - REST 404 + RxDB null → next/navigation `notFound()`
 *     - REST OK → use the server detail
 *     - REST failed/404 + RxDB has it → synthesize a minimal
 *       `EventDetail` from the doc so the offline-insert-direct-nav case
 *       renders the event instead of 404.
 *
 * The downstream `LiveEventView` / `EndedEventView` are unchanged.
 */

import { notFound, useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

import { LiveEventView } from "@/components/event/live-event-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, apiFetch } from "@/lib/api";
import { useMe } from "@/lib/auth";
import { useDatabase } from "@/lib/rxdb/provider";
import type { EventDocType } from "@/lib/rxdb/types";
import { coerceNumber, type EventDetail } from "@/lib/types";

type RxdbState =
  | { resolved: false; doc: null }
  | { resolved: true; doc: EventDocType | null };

type ServerState =
  | { status: "loading" }
  | { status: "ok"; detail: EventDetail }
  | { status: "not-found" }
  | { status: "error" };

export default function EventDetailPage() {
  // `useParams()` reads the dynamic segment client-side without
  // suspending — App Router's `params` Promise was a poor fit because
  // suspending the entire page on a synchronous route segment hurts
  // both UX and testability.
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const router = useRouter();
  const me = useMe();
  const database = useDatabase();
  const [rxdb, setRxdb] = useState<RxdbState>({ resolved: false, doc: null });
  const [server, setServer] = useState<ServerState>({ status: "loading" });

  // RxDB subscription: tracks the event doc reactively. The `resolved`
  // flag distinguishes "haven't heard back yet" from "RxDB definitely
  // doesn't have this id" — we need that disambiguation for the
  // hard-404 branch.
  useEffect(() => {
    if (!database) return;
    setRxdb({ resolved: false, doc: null });
    const sub = database.events.findOne(id).$.subscribe((next) => {
      setRxdb({ resolved: true, doc: next ? (next.toJSON() as EventDocType) : null });
    });
    return () => sub.unsubscribe();
  }, [database, id]);

  // One-shot REST fetch for fields not in RxDB (`plus_code`,
  // `participants`). M5c.1b promotes participants to their own sync
  // collection; this fetch then becomes plus_code-only or vanishes.
  useEffect(() => {
    let cancelled = false;
    setServer({ status: "loading" });
    apiFetch<EventDetail>(`/api/events/${id}`)
      .then((detail) => {
        if (cancelled) return;
        setServer({ status: "ok", detail });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 404) {
          setServer({ status: "not-found" });
        } else {
          setServer({ status: "error" });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Auth gating. `useMe()` resolves to `null` for anonymous users; we
  // bounce to login and pass `next` so the post-login redirect lands
  // back here.
  useEffect(() => {
    if (!me.isPending && me.data === null) {
      router.replace(`/login?next=/events/${id}`);
    }
  }, [me.isPending, me.data, router, id]);

  // Auth still resolving or anonymous → skeleton (the redirect effect
  // above moves the page along).
  const user = me.data;
  if (me.isPending || !user) {
    return <DetailSkeleton />;
  }

  // Both data sources still pending → skeleton.
  if (!rxdb.resolved && server.status === "loading") {
    return <DetailSkeleton />;
  }

  // Hard 404: server is sure it's gone AND RxDB doesn't have it.
  if (rxdb.resolved && rxdb.doc === null && server.status === "not-found") {
    notFound();
  }

  // Pick the source of truth for the initial event payload.
  const initial = pickInitialEvent(server, rxdb);
  if (!initial) {
    // REST is loading and RxDB has nothing yet — keep showing skeleton.
    if (server.status === "loading" || (server.status === "error" && !rxdb.resolved)) {
      return <DetailSkeleton />;
    }
    // REST failed and RxDB resolved-empty → can't render anything useful.
    return <UnavailableCard />;
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {initial.ended_at === null ? "Live-Event" : "Event"}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Gestartet am {new Date(initial.started_at).toLocaleString("de-DE")}
          {initial.ended_at
            ? ` · beendet ${new Date(initial.ended_at).toLocaleString("de-DE")}`
            : ""}
        </p>
      </header>
      {initial.ended_at === null ? (
        <LiveEventView user={user} initialEvent={initial} />
      ) : (
        <EndedEventView event={initial} />
      )}
    </div>
  );
}

/**
 * Decide which payload to render with.
 *
 * REST OK is always preferred (it carries `plus_code` and
 * `participants`). When REST has failed or returned 404 but RxDB has
 * the doc — which is the offline-insert-then-direct-nav case — we fall
 * back to a synthesized `EventDetail` whose `plus_code` and
 * `participants` are empty placeholders. M5c.1b promotes these to a
 * proper sync collection.
 */
function pickInitialEvent(server: ServerState, rxdb: RxdbState): EventDetail | null {
  if (server.status === "ok") return server.detail;
  if (rxdb.resolved && rxdb.doc) return synthesizeFromRxdb(rxdb.doc);
  return null;
}

function synthesizeFromRxdb(doc: EventDocType): EventDetail {
  return {
    id: doc.id,
    started_at: doc.started_at,
    ended_at: doc.ended_at,
    lat: doc.lat,
    lon: doc.lon,
    reveal_participants: doc.reveal_participants,
    note: doc.note,
    w3w_legacy: doc.w3w_legacy,
    created_by: doc.created_by,
    created_at: doc.created_at,
    updated_at: doc.updated_at,
    plus_code: "",
    participants: [],
  };
}

function DetailSkeleton() {
  return (
    <div
      className="mx-auto flex w-full max-w-3xl flex-col gap-4"
      data-testid="event-detail-skeleton"
    >
      <header className="flex flex-col gap-1">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64" />
      </header>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-2 h-4 w-56" />
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

function UnavailableCard() {
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
        <CardContent>
          <Button asChild variant="secondary">
            <Link href="/">Zurück zum Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
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
          folgt mit M5c.2.
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
