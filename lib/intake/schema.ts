import type { FieldDef, FieldId, StepId } from "./types";

export const STEPS: { id: StepId; title: string; question: string; intro: string }[] = [
  {
    id: 1,
    title: "About you",
    question: "Let's start with your name",
    intro: "Exactly as it appears on your ID.",
  },
  {
    id: 2,
    title: "Contact",
    question: "How can we reach you?",
    intro: "We use this to confirm your appointment and send results.",
  },
  {
    id: 3,
    title: "Preferences",
    question: "A few preferences",
    intro: "So we can book an interpreter if you need one.",
  },
  {
    id: 4,
    title: "Emergency & more",
    question: "Anything else we should know?",
    intro: "Nothing here is required. Leave it blank and continue.",
  },
];

export const GENDER_OPTIONS = ["Female", "Male", "Non-binary", "Prefer not to say"];

export const LANGUAGE_OPTIONS = [
  "English",
  "Spanish",
  "Mandarin",
  "Tagalog",
  "Vietnamese",
  "Arabic",
  "French",
  "Twi",
  "Thai",
];

export const NATIONALITY_OPTIONS = [
  "American",
  "Brazilian",
  "British",
  "Chinese",
  "Filipino",
  "French",
  "German",
  "Ghanaian",
  "Indian",
  "Italian",
  "Japanese",
  "Mexican",
  "Nigerian",
  "Thai",
  "Vietnamese",
];

export const RELATIONSHIP_OPTIONS = [
  "Parent",
  "Sibling",
  "Spouse or partner",
  "Child",
  "Friend",
  "Other",
];

export const RELIGION_OPTIONS = [
  "Prefer not to say",
  "Buddhist",
  "Christian",
  "Hindu",
  "Jewish",
  "Muslim",
  "None",
  "Other",
];

export const FIELDS: FieldDef[] = [
  { id: "firstName", label: "First name", step: 1, kind: "text", required: true },
  {
    id: "middleName",
    label: "Middle name",
    step: 1,
    kind: "text",
    required: false,
    help: "Add if you have one.",
  },
  { id: "lastName", label: "Last name", step: 1, kind: "text", required: true },
  { id: "dateOfBirth", label: "Date of birth", step: 1, kind: "date", required: true },
  {
    id: "gender",
    label: "Gender",
    step: 1,
    kind: "radio",
    required: true,
    options: GENDER_OPTIONS,
  },
  { id: "phone", label: "Phone number", step: 2, kind: "tel", required: true },
  {
    id: "email",
    label: "Email",
    step: 2,
    kind: "email",
    required: true,
    help: "We only email about your care.",
  },
  { id: "address", label: "Home address", step: 2, kind: "text", required: true },
  {
    id: "preferredLanguage",
    label: "Preferred language",
    step: 3,
    kind: "combobox",
    required: true,
    options: LANGUAGE_OPTIONS,
    help: "If this isn't English, the front desk is told before you're called.",
  },
  {
    id: "nationality",
    label: "Nationality",
    step: 3,
    kind: "combobox",
    required: true,
    options: NATIONALITY_OPTIONS,
  },
  {
    id: "emergencyContactName",
    label: "Emergency contact",
    step: 4,
    kind: "text",
    required: false,
    help: "Filling one of these three asks for the other two.",
  },
  {
    id: "emergencyContactRelationship",
    label: "Relationship",
    step: 4,
    kind: "select",
    required: false,
    options: RELATIONSHIP_OPTIONS,
  },
  {
    id: "emergencyContactPhone",
    label: "Their phone",
    step: 4,
    kind: "tel",
    required: false,
  },
  {
    id: "religion",
    label: "Religion",
    step: 4,
    kind: "combobox",
    required: false,
    options: RELIGION_OPTIONS,
    help: "Used only to respect dietary and chaplaincy requests.",
  },
];

export const TOTAL_FIELDS = FIELDS.length;

export const OPTIONAL_FIELD_IDS = FIELDS.filter((f) => !f.required).map((f) => f.id);

export function getField(id: FieldId): FieldDef {
  const field = FIELDS.find((f) => f.id === id);
  if (!field) throw new Error(`Unknown field: ${id}`);
  return field;
}

export function fieldsForStep(step: StepId): FieldDef[] {
  return FIELDS.filter((f) => f.step === step);
}
