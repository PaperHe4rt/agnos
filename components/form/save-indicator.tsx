import { formatRelativeTime } from "@/lib/intake/status";
import type { SaveState } from "@/hooks/useIntakeSync";

export function SaveIndicator({
  state,
  now,
}: {
  state: SaveState;
  now: number;
}) {
  if (state.status === "idle") return null;

  const failed = state.status === "failed";
  const text =
    state.status === "saving"
      ? "Saving…"
      : failed
        ? "Not saved · retrying"
        : `Saved · ${formatRelativeTime(state.at, now)}`;

  return (
    <p
      role="status"
      className={`text-meta ${failed ? "font-semibold text-danger" : "text-ink-soft"}`}
    >
      {text}
    </p>
  );
}
