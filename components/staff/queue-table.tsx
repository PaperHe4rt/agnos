import { getField } from "@/lib/intake/schema";
import {
  formatDateOfBirth,
  formatRelativeTime,
  getAttentionFlag,
  getProgress,
  getStatus,
  isTyping,
  lastUpdatedField,
} from "@/lib/intake/status";
import type { IntakeSession } from "@/lib/intake/types";
import { AttentionFlagBadge, StatusBadge } from "./status-badge";
import { patientName } from "./summary";

type QueueTableProps = {
  sessions: IntakeSession[];
  now: number;
  selectedId: string | null;
  onOpen: (id: string) => void;
};

function lastFieldCell(session: IntakeSession) {
  const field = lastUpdatedField(session);
  if (!field) return "—";

  const raw = session.values[field]?.trim();
  const value = field === "dateOfBirth" && raw ? formatDateOfBirth(raw) : raw;
  const shown = value && value.length > 28 ? `${value.slice(0, 28)}…` : value;
  return `${getField(field).label}${shown ? ` · ${shown}` : ""}`;
}

export function QueueTable({
  sessions,
  now,
  selectedId,
  onOpen,
}: QueueTableProps) {
  return (
    <table className="w-full border-collapse text-left">
      <caption className="sr-only">
        Patients in the intake queue, most recent activity first
      </caption>
      <thead>
        <tr className="border-b border-line text-label text-ink-soft">
          <th scope="col" className="py-2 pr-4 font-semibold">
            Patient
          </th>
          <th scope="col" className="py-2 pr-4 font-semibold">
            Status
          </th>
          <th scope="col" className="py-2 pr-4 font-semibold">
            Progress
          </th>
          <th scope="col" className="py-2 pr-4 font-semibold">
            Last field
          </th>
          <th scope="col" className="py-2 font-semibold">
            Updated
          </th>
        </tr>
      </thead>
      <tbody>
        {sessions.map((session) => {
          const { answered, total } = getProgress(session);
          const dateOfBirth = session.values.dateOfBirth;
          const updatedAt =
            session.submittedAt ?? session.lastKeystrokeAt;

          return (
            <tr
              key={session.id}
              className={`border-b border-canvas-edge align-middle ${
                selectedId === session.id ? "bg-accent-tint" : ""
              }`}
            >
              <td className="py-3 pr-4">
                <button
                  type="button"
                  onClick={() => onOpen(session.id)}
                  className="rounded-field text-left font-semibold text-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {patientName(session.values)}
                </button>
                <p className="font-mono text-meta text-ink-soft">
                  {dateOfBirth ? formatDateOfBirth(dateOfBirth) : "No date of birth yet"}
                </p>
              </td>
              <td className="py-3 pr-4">
                <div className="flex flex-col items-start gap-1">
                  <StatusBadge
                    status={getStatus(session, now)}
                    pulse={isTyping(session, now)}
                  />
                  <AttentionFlagBadge flag={getAttentionFlag(session)} />
                </div>
              </td>
              <td className="py-3 pr-4 font-mono text-meta text-ink-muted">
                {answered}/{total}
              </td>
              <td className="py-3 pr-4 text-label text-ink-muted">
                {lastFieldCell(session)}
              </td>
              <td className="py-3 font-mono text-meta text-ink-muted">
                {formatRelativeTime(updatedAt, now)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
