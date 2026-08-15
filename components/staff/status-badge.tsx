import type { AttentionFlag, PatientStatus } from "@/lib/intake/types";

const STATUS = {
  active: { label: "Active", dot: "rounded-full bg-status-active" },
  submitted: { label: "Submitted", dot: "rounded-xs bg-status-submitted" },
  inactive: {
    label: "Inactive",
    dot: "rounded-full bg-status-inactive ring-1 ring-ink-soft",
  },
} satisfies Record<PatientStatus, { label: string; dot: string }>;

export function StatusBadge({ status }: { status: PatientStatus }) {
  const { label, dot } = STATUS[status];
  return (
    <span className="inline-flex items-center gap-2 text-label font-semibold text-ink">
      <span aria-hidden="true" className={`size-2.5 shrink-0 ${dot}`} />
      {label}
    </span>
  );
}

export function AttentionFlagBadge({ flag }: { flag: AttentionFlag }) {
  if (!flag) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-danger-tint px-2 py-0.5 text-meta font-semibold text-danger">
      <span aria-hidden="true">⚑</span>
      Needs help
    </span>
  );
}
