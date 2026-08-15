"use client";

import { Wordmark } from "@/components/wordmark";
import { ConnectionPill } from "@/components/staff/connection-status";
import { StaffQueue } from "@/components/staff/staff-queue";
import { useIntakeChannel } from "@/hooks/useIntakeChannel";
import { useNow } from "@/hooks/useNow";

export default function StaffPage() {
  const { sessions, connection } = useIntakeChannel();
  const now = useNow();

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-canvas-edge px-6 py-5 sm:px-10">
        <div>
          <Wordmark context="Intake queue" />
          <p className="mt-1 text-meta text-ink-soft">
            Today · {sessions.length}{" "}
            {sessions.length === 1 ? "patient" : "patients"}
          </p>
        </div>
        <ConnectionPill connection={connection} />
      </header>

      <main className="flex-1">
        <h1 className="sr-only">Intake queue</h1>
        <StaffQueue sessions={sessions} now={now} connection={connection} />
      </main>
    </div>
  );
}
