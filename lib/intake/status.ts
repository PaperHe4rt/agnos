import { OPTIONAL_FIELD_IDS, TOTAL_FIELDS } from "./schema";
import { countAnswered } from "./validation";
import type {
  AttentionFlag,
  FieldId,
  IntakeSession,
  PatientStatus,
} from "./types";

export const TYPING_WINDOW_MS = 30_000;
export const INACTIVE_AFTER_MS = 3 * 60_000;
export const FAILED_VALIDATIONS_FOR_HELP = 3;
export const ERROR_SUBMITS_FOR_HELP = 2;

export function getStatus(session: IntakeSession, now: number): PatientStatus {
  if (session.submittedAt !== null) return "submitted";
  return now - session.lastKeystrokeAt >= INACTIVE_AFTER_MS
    ? "inactive"
    : "active";
}

// Drives the pulsing dot and the "typing" line, not the status itself.
export function isTyping(session: IntakeSession, now: number): boolean {
  if (session.submittedAt !== null) return false;
  return now - session.lastKeystrokeAt < TYPING_WINDOW_MS;
}

export function getAttentionFlag(session: IntakeSession): AttentionFlag {
  if (session.submittedAt !== null) return null;

  const stuckOnField = Object.values(session.failedValidations).some(
    (count) => count >= FAILED_VALIDATIONS_FOR_HELP,
  );
  const stuckOnSubmit = session.errorSubmits >= ERROR_SUBMITS_FOR_HELP;

  return stuckOnField || stuckOnSubmit ? "needs_help" : null;
}

export function getProgress(session: IntakeSession) {
  const settled = session.submittedAt !== null ? OPTIONAL_FIELD_IDS : [];
  return {
    answered: countAnswered(session.values, settled),
    total: TOTAL_FIELDS,
  };
}

export function lastUpdatedField(session: IntakeSession): FieldId | null {
  let latest: FieldId | null = null;
  let latestAt = -Infinity;

  for (const [id, at] of Object.entries(session.fieldUpdatedAt) as [
    FieldId,
    number,
  ][]) {
    if (at > latestAt) {
      latest = id;
      latestAt = at;
    }
  }
  return latest;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatDateOfBirth(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return value;

  const [, year, month, day] = match;
  const name = MONTHS[Number(month) - 1];
  return name ? `${day} ${name} ${year}` : value;
}

export function formatRelativeTime(timestamp: number, now: number): string {
  const seconds = Math.floor((now - timestamp) / 1000);
  if (seconds < 5) return "now";
  if (seconds < 60) return `${seconds}s ago`;

  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
}
