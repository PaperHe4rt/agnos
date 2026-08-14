export type FieldId =
  | "firstName"
  | "middleName"
  | "lastName"
  | "dateOfBirth"
  | "gender"
  | "phone"
  | "email"
  | "address"
  | "preferredLanguage"
  | "nationality"
  | "emergencyContactName"
  | "emergencyContactRelationship"
  | "emergencyContactPhone"
  | "religion";

export type StepId = 1 | 2 | 3 | 4;

export type FieldKind =
  | "text"
  | "email"
  | "tel"
  | "date"
  | "textarea"
  | "radio"
  | "select"
  | "combobox";

export type FieldDef = {
  id: FieldId;
  label: string;
  step: StepId;
  kind: FieldKind;
  required: boolean;
  help?: string;
  options?: string[];
};

export type FieldValues = Partial<Record<FieldId, string>>;

export type FieldErrors = Partial<Record<FieldId, string>>;

export type PatientStatus = "active" | "inactive" | "submitted";

export type AttentionFlag = "needs_help" | null;

export type IntakeSession = {
  id: string;
  values: FieldValues;
  lastKeystrokeAt: number;
  submittedAt: number | null;
  skippedFields: FieldId[];
  failedValidations: Partial<Record<FieldId, number>>;
  errorSubmits: number;
};
