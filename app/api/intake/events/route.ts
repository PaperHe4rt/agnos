import { FIELDS } from "@/lib/intake/schema";
import type { FieldId, FieldValues } from "@/lib/intake/types";
import { applyPatch, type SessionPatch } from "@/lib/realtime/hub";

const FIELD_IDS = new Set<string>(FIELDS.map((f) => f.id));
const MAX_VALUE_LENGTH = 500;

function parseValues(input: unknown): FieldValues | undefined {
  if (typeof input !== "object" || input === null) return undefined;

  const values: FieldValues = {};
  for (const [key, value] of Object.entries(input)) {
    if (!FIELD_IDS.has(key) || typeof value !== "string") continue;
    values[key as FieldId] = value.slice(0, MAX_VALUE_LENGTH);
  }
  return values;
}

function parseCounts(input: unknown) {
  if (typeof input !== "object" || input === null) return undefined;

  const counts: Partial<Record<FieldId, number>> = {};
  for (const [key, value] of Object.entries(input)) {
    if (!FIELD_IDS.has(key) || typeof value !== "number") continue;
    counts[key as FieldId] = Math.max(0, Math.floor(value));
  }
  return counts;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Body must be JSON." }, { status: 400 });
  }

  const { sessionId, ...rest } = (body ?? {}) as Record<string, unknown>;
  if (typeof sessionId !== "string" || sessionId.trim() === "") {
    return Response.json({ error: "sessionId is required." }, { status: 400 });
  }

  const patch: SessionPatch = {
    values: parseValues(rest.values),
    submitted: rest.submitted === true,
    failedValidations: parseCounts(rest.failedValidations),
    errorSubmits:
      typeof rest.errorSubmits === "number"
        ? Math.max(0, Math.floor(rest.errorSubmits))
        : undefined,
  };

  return Response.json(applyPatch(sessionId, patch));
}
