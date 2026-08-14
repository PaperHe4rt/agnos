import type { FieldDef, FieldId, FieldKind } from "@/lib/intake/types";
import { Field, fieldIds } from "./field";
import { RadioGroup } from "./radio-group";
import { TextInput } from "./text-input";

function inputType(kind: FieldKind) {
  switch (kind) {
    case "text":
    case "tel":
    case "email":
    case "date":
      return kind;
    default:
      throw new Error(`No control for field kind: ${kind}`);
  }
}

type FormFieldProps = {
  field: FieldDef;
  value: string;
  error?: string;
  onChange: (id: FieldId, value: string) => void;
  onBlur: (id: FieldId) => void;
};

export function FormField({
  field,
  value,
  error,
  onChange,
  onBlur,
}: FormFieldProps) {
  const { helpId, errorId, describedBy } = fieldIds(
    field.id,
    field.help,
    error,
  );

  const shell = {
    id: field.id,
    label: field.label,
    required: field.required,
    help: field.help,
    helpId,
    error,
    errorId,
    describedBy,
  };

  if (field.kind === "radio") {
    return (
      <Field {...shell} asGroup>
        <RadioGroup
          name={field.id}
          options={field.options ?? []}
          value={value}
          onSelect={(next) => {
            onChange(field.id, next);
            onBlur(field.id);
          }}
        />
      </Field>
    );
  }

  return (
    <Field {...shell}>
      <TextInput
        id={field.id}
        type={inputType(field.kind)}
        value={value}
        required={field.required}
        invalid={Boolean(error)}
        describedBy={describedBy}
        onChange={(next) => onChange(field.id, next)}
        onBlur={() => onBlur(field.id)}
      />
    </Field>
  );
}
