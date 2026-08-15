import type { FieldId, FieldValues, IntakeSession } from "@/lib/intake/types";

export type SessionPatch = {
  values?: FieldValues;
  submitted?: boolean;
  failedValidations?: Partial<Record<FieldId, number>>;
  errorSubmits?: number;
};

type Listener = (session: IntakeSession) => void;

const SESSION_TTL_MS = 2 * 60 * 60_000;

type Hub = {
  sessions: Map<string, IntakeSession>;
  listeners: Set<Listener>;
};

const globalForHub = globalThis as typeof globalThis & { intakeHub?: Hub };

const hub = (globalForHub.intakeHub ??= {
  sessions: new Map(),
  listeners: new Set(),
});

function lastActivity(session: IntakeSession) {
  return Math.max(session.lastKeystrokeAt, session.submittedAt ?? 0);
}

function sweep(now: number) {
  for (const [id, session] of hub.sessions) {
    if (now - lastActivity(session) > SESSION_TTL_MS) hub.sessions.delete(id);
  }
}

function blankSession(id: string, now: number): IntakeSession {
  return {
    id,
    values: {},
    fieldUpdatedAt: {},
    lastKeystrokeAt: now,
    submittedAt: null,
    failedValidations: {},
    errorSubmits: 0,
  };
}

export function getSession(id: string): IntakeSession | undefined {
  return hub.sessions.get(id);
}

export function listSessions(now = Date.now()): IntakeSession[] {
  sweep(now);
  return [...hub.sessions.values()];
}

export function applyPatch(
  id: string,
  patch: SessionPatch,
  now = Date.now(),
): IntakeSession {
  sweep(now);

  const current = hub.sessions.get(id) ?? blankSession(id, now);
  const values = { ...current.values };
  const fieldUpdatedAt = { ...current.fieldUpdatedAt };

  for (const [key, value] of Object.entries(patch.values ?? {})) {
    const fieldId = key as FieldId;
    if (values[fieldId] === value) continue;
    values[fieldId] = value;
    fieldUpdatedAt[fieldId] = now;
  }

  const session: IntakeSession = {
    ...current,
    values,
    fieldUpdatedAt,
    lastKeystrokeAt: now,
    // Submission is terminal, so the first one wins.
    submittedAt: current.submittedAt ?? (patch.submitted ? now : null),
    failedValidations: patch.failedValidations ?? current.failedValidations,
    errorSubmits: patch.errorSubmits ?? current.errorSubmits,
  };

  hub.sessions.set(id, session);
  for (const listener of hub.listeners) listener(session);

  return session;
}

export function subscribe(listener: Listener): () => void {
  hub.listeners.add(listener);
  return () => hub.listeners.delete(listener);
}

export function resetHub() {
  hub.sessions.clear();
  hub.listeners.clear();
}
