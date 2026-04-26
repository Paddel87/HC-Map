"use client";

import { useMutation } from "@tanstack/react-query";
import { Crosshair, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { RecipientPicker } from "@/components/person/recipient-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGeolocation } from "@/hooks/use-geolocation";
import { apiFetch } from "@/lib/api";
import type { AuthUser } from "@/lib/auth";
import { DEFAULT_MAP_CENTER } from "@/lib/map";
import type { EventDetail, EventStartPayload, PersonRead } from "@/lib/types";

const LocationPickerMap = dynamic(
  () => import("@/components/map/location-picker-map").then((mod) => mod.LocationPickerMap),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[360px] w-full" />,
  },
);

export interface EventCreateFormProps {
  user: AuthUser;
}

export function EventCreateForm({ user }: EventCreateFormProps) {
  const router = useRouter();
  const geolocation = useGeolocation({ auto: true });
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [recipient, setRecipient] = useState<PersonRead | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (geolocation.fix && coords === null) {
      setCoords({ lat: geolocation.fix.lat, lon: geolocation.fix.lon });
    }
  }, [geolocation.fix, coords]);

  const startEvent = useMutation({
    mutationFn: async (payload: EventStartPayload) =>
      apiFetch<EventDetail>("/api/events/start", {
        method: "POST",
        body: payload,
      }),
    onSuccess: (event) => {
      toast.success("Event gestartet", {
        description: "Live-Erfassung läuft. Wakelock hält den Bildschirm an.",
      });
      router.push(`/events/${event.id}`);
      router.refresh();
    },
    onError: (error) => {
      toast.error("Event konnte nicht gestartet werden", {
        description: error instanceof Error ? error.message : String(error),
      });
    },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!coords) {
      toast.error("Standort fehlt", {
        description: "Bitte den Marker auf der Karte setzen oder GPS aktivieren.",
      });
      return;
    }
    const payload: EventStartPayload = {
      lat: coords.lat,
      lon: coords.lon,
    };
    if (recipient) payload.recipient_id = recipient.id;
    const trimmedNote = note.trim();
    if (trimmedNote) payload.note = trimmedNote;
    startEvent.mutate(payload);
  }

  const submitLabel = startEvent.isPending ? "Starte…" : "Event starten";
  const gpsLabel =
    geolocation.status === "requesting" ? "Standort wird ermittelt…" : "Standort erneut anfordern";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Standort</CardTitle>
          <CardDescription>
            GPS wird beim Öffnen abgefragt. Marker auf der Karte verschieben oder antippen, um zu
            korrigieren.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => geolocation.request()}
              disabled={geolocation.status === "requesting"}
            >
              {geolocation.status === "requesting" ? (
                <Loader2 className="animate-spin" aria-hidden />
              ) : (
                <Crosshair aria-hidden />
              )}
              {gpsLabel}
            </Button>
            {geolocation.error ? (
              <span className="text-xs text-amber-700 dark:text-amber-400">
                {geolocation.error}
              </span>
            ) : null}
            {coords ? (
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                {coords.lat.toFixed(6)}, {coords.lon.toFixed(6)}
              </span>
            ) : null}
          </div>
          <LocationPickerMap
            lat={coords?.lat ?? null}
            lon={coords?.lon ?? null}
            onChange={(next) => setCoords(next)}
          />
          {!coords ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Standort ist Pflicht. Tippe auf die Karte, um einen Marker zu setzen (Default-Center{" "}
              {DEFAULT_MAP_CENTER.lat.toFixed(2)}, {DEFAULT_MAP_CENTER.lon.toFixed(2)}).
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recipient</CardTitle>
          <CardDescription>
            Wer ist Empfänger:in? Ohne Auswahl ist Self-Bondage Default (Performer = Recipient =
            du).
            {recipient ? (
              <span className="mt-1 block text-xs text-slate-700 dark:text-slate-300">
                Hinweis: {recipient.name} wird automatisch als Beteiligte:r erfasst und kann das
                Event später einsehen (ADR-012).
              </span>
            ) : null}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecipientPicker
            value={recipient}
            onChange={setRecipient}
            excludePersonIds={[user.person_id]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notiz (optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Kontext, Stimmung, Setting…"
            rows={3}
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:focus-visible:ring-slate-300"
          />
        </CardContent>
      </Card>

      <div className="sticky bottom-0 flex flex-col gap-2 border-t border-slate-200 bg-slate-50/95 p-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 md:static md:border-0 md:bg-transparent md:p-0">
        <Button type="submit" size="lg" disabled={!coords || startEvent.isPending}>
          {submitLabel}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={startEvent.isPending}
        >
          Abbrechen
        </Button>
      </div>
    </form>
  );
}
