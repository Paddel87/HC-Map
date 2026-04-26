"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { RecipientPicker } from "@/components/person/recipient-picker";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { apiFetch } from "@/lib/api";
import type { ApplicationLiveStartPayload, ApplicationRead, PersonRead } from "@/lib/types";

export interface ApplicationStartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  performerPersonId: string;
  defaultRecipient: PersonRead | null;
  onCreated: (application: ApplicationRead) => void;
}

export function ApplicationStartSheet({
  open,
  onOpenChange,
  eventId,
  performerPersonId,
  defaultRecipient,
  onCreated,
}: ApplicationStartSheetProps) {
  const queryClient = useQueryClient();
  const [recipient, setRecipient] = useState<PersonRead | null>(defaultRecipient);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) {
      setRecipient(defaultRecipient);
      setNote("");
    }
  }, [open, defaultRecipient]);

  const start = useMutation({
    mutationFn: async (payload: ApplicationLiveStartPayload): Promise<ApplicationRead> =>
      apiFetch<ApplicationRead>(`/api/events/${eventId}/applications/start`, {
        method: "POST",
        body: payload,
      }),
    onSuccess: async (application) => {
      toast.success("Application gestartet", {
        description: `Sequenz #${application.sequence_no}.`,
      });
      onCreated(application);
      onOpenChange(false);
      await queryClient.invalidateQueries({ queryKey: ["events", eventId, "applications"] });
    },
    onError: (error) => {
      toast.error("Application konnte nicht gestartet werden", {
        description: error instanceof Error ? error.message : String(error),
      });
    },
  });

  function submit() {
    const payload: ApplicationLiveStartPayload = {};
    if (recipient) payload.recipient_id = recipient.id;
    const trimmed = note.trim();
    if (trimmed) payload.note = trimmed;
    start.mutate(payload);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Neue Application starten</SheetTitle>
          <SheetDescription>
            Performer = du. Recipient ohne Auswahl = Self-Bondage. Restraints und Positionen kannst
            du später nachpflegen.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Recipient</Label>
            <RecipientPicker
              value={recipient}
              onChange={setRecipient}
              excludePersonIds={[performerPersonId]}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="application-note">Notiz (optional)</Label>
            <textarea
              id="application-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="z. B. Stimmung, Aufbau, Materialwechsel danach…"
              rows={3}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:focus-visible:ring-slate-300"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={start.isPending}
            >
              Abbrechen
            </Button>
            <Button type="button" className="flex-1" onClick={submit} disabled={start.isPending}>
              {start.isPending ? "Starte…" : "Application starten"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
