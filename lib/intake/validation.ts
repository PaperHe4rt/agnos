import { FIELDS, fieldsForStep, getField } from "./schema";
import type { FieldErrors, FieldId, FieldValues, StepId } from "./types";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const MAX_AGE_YEARS = 120;

export function dateOfBirthBounds(today: string) {
  const oldest = new Date(today);
  oldest.setFullYear(oldest.getFullYear() - MAX_AGE_YEARS);
  return { min: oldest.toISOString().slice(0, 10), max: today };
}

function isBlank(value: string | undefined) {
  return !value || value.trim() === "";
}

function validatePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) {
    return "Enter a phone number we can reach you on, including the area code.";
  }
  return null;
}

function validateDateOfBirth(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime()))
    return "Enter your date of birth as day, month and year.";

  const now = new Date();
  if (date > now) return "Date of birth can't be in the future.";

  const oldest = new Date();
  oldest.setFullYear(oldest.getFullYear() - MAX_AGE_YEARS);
  if (date < oldest) return "Check the year — that date looks too far back.";

  return null;
}

const EMERGENCY_FIELDS = {
  emergencyContactName: "Add their name so we know who to call.",
  emergencyContactRelationship: "Add how they're related to you.",
  emergencyContactPhone: "Add a number we can reach them on.",
} as const;

type EmergencyFieldId = keyof typeof EMERGENCY_FIELDS;

function isEmergencyField(id: FieldId): id is EmergencyFieldId {
  return id in EMERGENCY_FIELDS;
}

function emergencyContactStarted(values: FieldValues) {
  const ids = Object.keys(EMERGENCY_FIELDS) as EmergencyFieldId[];
  return ids.some((id) => !isBlank(values[id]));
}

export function isFieldRequired(id: FieldId, values: FieldValues): boolean {
  if (isEmergencyField(id)) return emergencyContactStarted(values);
  return getField(id).required;
}

function validateEmergencyContact(id: EmergencyFieldId, values: FieldValues) {
  if (!emergencyContactStarted(values)) return null;

  const value = values[id]?.trim() ?? "";
  if (!value) return EMERGENCY_FIELDS[id];
  if (id === "emergencyContactPhone") return validatePhone(value);
  return null;
}

export function validateField(id: FieldId, values: FieldValues): string | null {
  if (isEmergencyField(id)) return validateEmergencyContact(id, values);

  const field = getField(id);
  const value = values[id]?.trim() ?? "";

  if (!value) {
    if (!field.required) return null;
    return "This answer is required.";
  }

  switch (id) {
    case "phone":
      return validatePhone(value);
    case "email":
      return EMAIL.test(value)
        ? null
        : "Enter an email address like name@example.com.";
    case "dateOfBirth":
      return validateDateOfBirth(value);
    default:
      return null;
  }
}

function collectErrors(ids: FieldId[], values: FieldValues): FieldErrors {
  const errors: FieldErrors = {};
  for (const id of ids) {
    const error = validateField(id, values);
    if (error) errors[id] = error;
  }
  return errors;
}

export function validateStep(step: StepId, values: FieldValues): FieldErrors {
  return collectErrors(
    fieldsForStep(step).map((f) => f.id),
    values,
  );
}

export function validateAll(values: FieldValues): FieldErrors {
  return collectErrors(
    FIELDS.map((f) => f.id),
    values,
  );
}

export function countAnswered(
  values: FieldValues,
  settled: FieldId[] = [],
): number {
  return FIELDS.filter((f) => !isBlank(values[f.id]) || settled.includes(f.id))
    .length;
}

export function countRequiredAnswered(values: FieldValues, step?: StepId) {
  const required = (step ? fieldsForStep(step) : FIELDS).filter(
    (f) => f.required,
  );
  return {
    answered: required.filter((f) => !isBlank(values[f.id])).length,
    total: required.length,
  };
}
