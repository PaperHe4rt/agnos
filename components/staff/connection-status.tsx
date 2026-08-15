import type { ConnectionState } from "@/lib/intake/types";

const CONNECTION = {
  connecting: { label: "Connecting", dot: "bg-status-inactive" },
  live: { label: "Live", dot: "bg-status-active" },
  reconnecting: { label: "Reconnecting", dot: "bg-status-inactive" },
  offline: { label: "Connection lost", dot: "bg-danger" },
} satisfies Record<ConnectionState, { label: string; dot: string }>;

export function ConnectionPill({ connection }: { connection: ConnectionState }) {
  const { label, dot } = CONNECTION[connection];
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-label font-semibold text-ink">
      <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

export function ConnectionBanner({ connection }: { connection: ConnectionState }) {
  if (connection === "live") return null;

  const copy =
    connection === "offline"
      ? "Nothing on this screen is updating. What you see is the last thing that reached us."
      : "Reconnecting to the intake channel. Answers may be a few seconds behind.";

  return (
    <p
      role="status"
      className="rounded-card border border-danger bg-danger-tint px-4 py-3 text-label text-ink"
    >
      <span className="font-semibold">{CONNECTION[connection].label}.</span> {copy}
    </p>
  );
}
