"use client";

import { Flag, Pause, Play, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { ApplicationStartSheet } from "@/components/event/application-start-sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNow } from "@/hooks/use-now";
import { useWakeLock } from "@/hooks/use-wake-lock";
import type { AuthUser } from "@/lib/auth";
import { useDatabase } from "@/lib/rxdb/provider";
import type { ApplicationDocType, EventDocType } from "@/lib/rxdb/types";
import { coerceNumber, type EventDetail, type PersonRead } from "@/lib/types";
import { diffSeconds, formatDuration } from "@/lib/duration";

const RECIPIENT_DRAFT_PREFIX = "hcmap:event-recipient:";

export interface LiveEventViewProps {
  user: AuthUser;
  initialEvent: EventDetail;
}

export function LiveEventView({ user, initialEvent }: LiveEventViewProps) {
  const router = useRouter();
  const database = useDatabase();
  const now = useNow(1000);
  const [startOpen, setStartOpen] = useState(false);

  const eventDoc = useEventDoc(initialEvent.id);
  const applications = useApplications(initialEvent.id);

  const event = useMemo<MergedEvent>(() => mergeEvent(initialEvent, eventDoc), [
    initialEvent,
    eventDoc,
  ]);
  const isLive = event.ended_at === null;
  useWakeLock(isLive);

  const totalSeconds = isLive
    ? Math.max(0, Math.round((now - Date.parse(event.started_at)) / 1000))
    : event.ended_at
      ? diffSeconds(event.started_at, event.ended_at)
      : 0;

  const activeApplication = applications.find((a) => a.ended_at === null) ?? null;
  const recipientPerson = pickRecipientPerson(
    applications,
    event.participants,
    user.person_id,
    initialEvent.id,
  );

  async function handleEndApplication(applicationId: string): Promise<void> {
    if (!database) return;
    const doc = await database.applications.findOne(applicationId).exec();
    if (!doc) {
      toast.error("Application nicht im lokalen Speicher gefunden");
      return;
    }
    const now = new Date().toISOString();
    await doc.patch({ ended_at: now, updated_at: now });
  }

  async function handleEndEvent(): Promise<void> {
    if (!database) return;
    const doc = await database.events.findOne(initialEvent.id).exec();
    if (!doc) {
      toast.error("Event nicht im lokalen Speicher gefunden");
      return;
    }
    const now = new Date().toISOString();
    await doc.patch({ ended_at: now, updated_at: now });
    toast.success("Event beendet", { description: "Wakelock freigegeben." });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2 text-base">
            <span>{isLive ? "Event läuft" : "Event beendet"}</span>
            <span className="font-mono text-2xl tabular-nums">{formatDuration(totalSeconds)}</span>
          </CardTitle>
          <CardDescription>
            Standort: {coerceNumber(event.lat).toFixed(5)}, {coerceNumber(event.lon).toFixed(5)}
            {event.plus_code ? ` · Plus Code ${event.plus_code}` : ""}
          </CardDescription>
        </CardHeader>
        {isLive ? (
          <CardContent className="flex flex-col gap-2">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <Button
                size="lg"
                onClick={() => setStartOpen(true)}
                disabled={!database}
              >
                <Plus aria-hidden /> Neue Application
              </Button>
              {activeApplication ? (
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => handleEndApplication(activeApplication.id)}
                  disabled={!database}
                >
                  <Pause aria-hidden /> Aktuelle beenden
                </Button>
              ) : (
                <Button size="lg" variant="secondary" disabled>
                  <Play aria-hidden /> Keine laufende Application
                </Button>
              )}
            </div>
            <Button
              size="lg"
              variant="destructive"
              onClick={handleEndEvent}
              disabled={!database}
            >
              <Flag aria-hidden /> Event beenden
            </Button>
          </CardContent>
        ) : null}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Applications</CardTitle>
          <CardDescription>
            {applications.length === 0
              ? "Noch keine Application erfasst."
              : `${applications.length} Application${applications.length === 1 ? "" : "s"} in Reihenfolge.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!database ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : applications.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Tippe auf „Neue Application“, um die erste zu starten.
            </p>
          ) : (
            <ApplicationList applications={applications} now={now} />
          )}
        </CardContent>
      </Card>

      <ApplicationStartSheet
        open={startOpen}
        onOpenChange={setStartOpen}
        eventId={initialEvent.id}
        performerPersonId={user.person_id}
        defaultRecipient={recipientPerson}
        onCreated={() => {
          // Reactive subscription updates the list automatically.
        }}
      />
    </div>
  );
}

interface MergedEvent {
  id: string;
  started_at: string;
  ended_at: string | null;
  lat: number | string;
  lon: number | string;
  note: string | null;
  plus_code: string;
  participants: readonly PersonRead[];
}

function mergeEvent(server: EventDetail, doc: EventDocType | null): MergedEvent {
  if (!doc) return server;
  return {
    id: doc.id,
    started_at: doc.started_at,
    ended_at: doc.ended_at,
    lat: doc.lat,
    lon: doc.lon,
    note: doc.note,
    plus_code: server.plus_code,
    participants: server.participants,
  };
}

function useEventDoc(eventId: string): EventDocType | null {
  const database = useDatabase();
  const [doc, setDoc] = useState<EventDocType | null>(null);
  useEffect(() => {
    if (!database) return;
    const sub = database.events
      .findOne(eventId)
      .$.subscribe((next) => setDoc(next ? (next.toJSON() as EventDocType) : null));
    return () => sub.unsubscribe();
  }, [database, eventId]);
  return doc;
}

function useApplications(eventId: string): ApplicationDocType[] {
  const database = useDatabase();
  const [docs, setDocs] = useState<ApplicationDocType[]>([]);
  useEffect(() => {
    if (!database) return;
    const sub = database.applications
      .find({
        selector: { event_id: eventId, _deleted: { $eq: false } },
        sort: [{ sequence_no: "asc" }],
      })
      .$.subscribe((rows) => setDocs(rows.map((r) => r.toJSON() as ApplicationDocType)));
    return () => sub.unsubscribe();
  }, [database, eventId]);
  return docs;
}

function ApplicationList({
  applications,
  now,
}: {
  applications: ApplicationDocType[];
  now: number;
}) {
  return (
    <ul className="flex flex-col gap-2">
      {applications.map((application) => {
        const startedAt = application.started_at;
        const endedAt = application.ended_at;
        const seconds = startedAt
          ? endedAt
            ? diffSeconds(startedAt, endedAt)
            : Math.max(0, Math.round((now - Date.parse(startedAt)) / 1000))
          : 0;
        const isActive = endedAt === null;
        return (
          <li
            key={application.id}
            className="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2 dark:border-slate-800"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  #{application.sequence_no}
                </span>
                <span
                  className={
                    isActive
                      ? "inline-flex h-2 w-2 rounded-full bg-emerald-500"
                      : "inline-flex h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-600"
                  }
                  aria-hidden
                />
                <span className="text-sm">{isActive ? "läuft" : "beendet"}</span>
              </div>
              {application.note ? (
                <p className="truncate pt-0.5 text-xs text-slate-600 dark:text-slate-400">
                  {application.note}
                </p>
              ) : null}
            </div>
            <span className="font-mono text-base tabular-nums">{formatDuration(seconds)}</span>
          </li>
        );
      })}
    </ul>
  );
}

function pickRecipientPerson(
  applications: readonly ApplicationDocType[],
  participants: readonly PersonRead[],
  excludePersonId: string,
  eventId: string,
): PersonRead | null {
  // Prefer the most recent application's recipient.
  for (let i = applications.length - 1; i >= 0; i -= 1) {
    const candidateId = applications[i]?.recipient_id;
    if (!candidateId || candidateId === excludePersonId) continue;
    const match = participants.find((p) => p.id === candidateId);
    if (match) return match;
  }
  // Fall back to the recipient drafted in the create form (sessionStorage).
  if (typeof window === "undefined") return null;
  let draftId: string | null = null;
  try {
    draftId = window.sessionStorage.getItem(`${RECIPIENT_DRAFT_PREFIX}${eventId}`);
  } catch {
    return null;
  }
  if (!draftId) return null;
  return participants.find((p) => p.id === draftId) ?? null;
}
