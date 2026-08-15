import { Wordmark } from "@/components/wordmark";
import { ConnectionPill } from "@/components/staff/connection-status";
import { StaffQueue } from "@/components/staff/staff-queue";
import type { ConnectionState } from "@/lib/intake/types";
import { FIXTURE_NOW, FIXTURE_SESSIONS } from "./fixtures";

export default async function StaffPage(props: PageProps<"/staff">) {
  const { state } = await props.searchParams;
  const sessions = state === "empty" ? [] : FIXTURE_SESSIONS;
  const connection: ConnectionState = state === "offline" ? "offline" : "live";

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
        <StaffQueue
          sessions={sessions}
          now={FIXTURE_NOW}
          connection={connection}
        />
      </main>
    </div>
  );
}
