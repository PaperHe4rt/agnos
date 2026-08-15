"use client";

import { formatRelativeTime } from "@/lib/intake/status";
import { useAnnouncement } from "@/hooks/useAnnouncement";
import type { SaveState } from "@/hooks/useIntakeSync";

const ANNOUNCEMENT: Record<SaveState["status"], string> = {
  idle: "",
  saving: "Saving your answers.",
  saved: "Your answers are saved.",
  failed: "Your answers are not saved yet. Still trying.",
};

export function SaveIndicator({
  state,
  now,
}: {
  state: SaveState;
  now: number;
}) {
  const announced = useAnnouncement(ANNOUNCEMENT[state.status]);

  const failed = state.status === "failed";
  const text =
    state.status === "saving"
      ? "Saving…"
      : failed
        ? "Not saved · retrying"
        : state.status === "saved"
          ? `Saved · ${formatRelativeTime(state.at, now)}`
          : "";

  return (
    <>
      {text ? (
        <p
          aria-hidden="true"
          className={`text-meta ${failed ? "font-semibold text-danger" : "text-ink-soft"}`}
        >
          {text}
        </p>
      ) : null}
      <span role="status" className="sr-only">
        {announced}
      </span>
    </>
  );
}
