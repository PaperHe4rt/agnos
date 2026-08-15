import {
  getAttentionFlag,
  getProgress,
  getStatus,
  isTyping,
} from "@/lib/intake/status";
import type { IntakeSession } from "@/lib/intake/types";
import { AttentionFlagBadge, StatusBadge } from "./status-badge";
import { describeActivity, patientName } from "./summary";

type PatientCardProps = {
  session: IntakeSession;
  now: number;
  selected: boolean;
  onOpen: (id: string) => void;
};

export function PatientCard({
  session,
  now,
  selected,
  onOpen,
}: PatientCardProps) {
  const flag = getAttentionFlag(session);
  const { answered, total } = getProgress(session);

  return (
    <button
      type="button"
      onClick={() => onOpen(session.id)}
      className={`flex w-full flex-col gap-3 rounded-card border bg-surface p-4 text-left shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
        flag ? "border-danger" : "border-canvas-edge hover:border-accent"
      } ${selected ? "ring-2 ring-accent" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-ink">
            {patientName(session.values)}
          </p>
        </div>
        <StatusBadge
          status={getStatus(session, now)}
          pulse={isTyping(session, now)}
        />
      </div>

      <AttentionFlagBadge flag={flag} />

      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-canvas-edge"
        >
          <span
            className="block h-full rounded-full bg-accent"
            style={{ width: `${(answered / total) * 100}%` }}
          />
        </span>
        <span className="font-mono text-meta text-ink-muted">
          {answered}/{total} answered
        </span>
      </div>

      <p className="text-meta text-ink-muted">
        {describeActivity(session, now)}
      </p>
    </button>
  );
}
