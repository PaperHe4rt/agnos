import { getField } from "@/lib/intake/schema";
import {
  formatRelativeTime,
  isTyping,
  lastUpdatedField,
} from "@/lib/intake/status";
import type { FieldValues, IntakeSession } from "@/lib/intake/types";

export function patientName(values: FieldValues): string {
  const name = [values.firstName, values.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");
  return name || "Awaiting name";
}

export function describeActivity(session: IntakeSession, now: number): string {
  if (session.submittedAt !== null) {
    return `Complete · ${formatRelativeTime(session.submittedAt, now)}`;
  }

  const field = lastUpdatedField(session);
  if (!field) return "No answers yet";

  const when = formatRelativeTime(session.fieldUpdatedAt[field]!, now);
  const verb = isTyping(session, now) ? "Typing" : "Stopped at";
  return `${verb} ${getField(field).label} · ${when}`;
}
