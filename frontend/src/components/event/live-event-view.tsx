"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Flag, Pause, Play, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ApplicationStartSheet } from "@/components/event/application-start-sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNow } from "@/hooks/use-now";
import { useWakeLock } from "@/hooks/use-wake-lock";
import { apiFetch } from "@/lib/api";
import type { AuthUser } from "@/lib/auth";
import { coerceNumber, type ApplicationRead, type EventDetail, type PersonRead } from "@/lib/types";
import { diffSeconds, formatDuration } from "@/lib/duration";

export interface LiveEventViewProps {
  user: AuthUser;
  initialEvent: EventDetail;
}

export function LiveEventView({ user, initialEvent }: LiveEventViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const wakeLock = useWakeLock(initialEvent.ended_at === null);
  const now = useNow(1000);
  const [startOpen, setStartOpen] = useState(false);

  const eventQuery = useQuery({
    queryKey: ["events", initialEvent.id, "detail"],
    queryFn: () => apiFetch<EventDetail>(`/api/events/${initialEvent.id}`),
    initialData: initialEvent,
    refetchInterval: 30_000,
  });
  const event = eventQuery.data ?? initialEvent;
  const isLive = event.ended_at === null;

  const applicationsQuery = useQuery({
    queryKey: ["events", initialEvent.id, "applications"],
    queryFn: () => apiFetch<ApplicationRead[]>(`/api/events/${initialEvent.id}/applications`),
    refetchInterval: isLive ? 5_000 : false,
  });
  const applications = applicationsQuery.data ?? [];

  const endApplication = useMutation({
    mutationFn: (applicationId: string) =>
      apiFetch<ApplicationRead>(`/api/applications/${applicationId}/end`, { method: "POST" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["events", initialEvent.id, "applications"],
      });
    },
    onError: (error) => {
      toast.error("Application konnte nicht beendet werden", {
        description: error instanceof Error ? error.message : String(error),
      });
    },
  });

  const endEvent = useMutation({
    mutationFn: () =>
      apiFetch<EventDetail>(`/api/events/${initialEvent.id}/end`, { method: "POST" }),
    onSuccess: async () => {
      toast.success("Event beendet", { description: "Wakelock freigegeben." });
      await queryClient.invalidateQueries({ queryKey: ["events", initialEvent.id, "detail"] });
      await queryClient.invalidateQueries({
        queryKey: ["events", initialEvent.id, "applications"],
      });
      router.push("/");
      router.refresh();
    },
    onError: (error) => {
      toast.error("Event konnte nicht beendet werden", {
        description: error instanceof Error ? error.message : String(error),
      });
    },
  });

  const totalSeconds = isLive
    ? Math.max(0, Math.round((now - Date.parse(event.started_at)) / 1000))
    : event.ended_at
      ? diffSeconds(event.started_at, event.ended_at)
      : 0;

  const activeApplication = applications.find((a) => a.ended_at === null) ?? null;
  const recipientPerson = pickRecipientPerson(applications, event.participants, user.person_id);

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
            {wakeLock.message ? (
              <span className="block pt-1 text-amber-700 dark:text-amber-400">
                {wakeLock.message}
              </span>
            ) : null}
          </CardDescription>
        </CardHeader>
        {isLive ? (
          <CardContent className="flex flex-col gap-2">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <Button
                size="lg"
                onClick={() => setStartOpen(true)}
                disabled={endApplication.isPending || endEvent.isPending}
              >
                <Plus aria-hidden /> Neue Application
              </Button>
              {activeApplication ? (
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => endApplication.mutate(activeApplication.id)}
                  disabled={endApplication.isPending || endEvent.isPending}
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
              onClick={() => endEvent.mutate()}
              disabled={endEvent.isPending}
            >
              <Flag aria-hidden /> {endEvent.isPending ? "Beende…" : "Event beenden"}
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
          {applicationsQuery.isPending ? (
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
        onCreated={async () => {
          await queryClient.invalidateQueries({
            queryKey: ["events", initialEvent.id, "applications"],
          });
        }}
      />
    </div>
  );
}

function ApplicationList({ applications, now }: { applications: ApplicationRead[]; now: number }) {
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
  applications: readonly ApplicationRead[],
  participants: readonly PersonRead[],
  excludePersonId: string,
): PersonRead | null {
  for (let i = applications.length - 1; i >= 0; i -= 1) {
    const candidateId = applications[i]?.recipient_id;
    if (!candidateId || candidateId === excludePersonId) continue;
    const match = participants.find((p) => p.id === candidateId);
    if (match) return match;
  }
  return null;
}
