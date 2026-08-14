import { dateOfBirthBounds } from "@/lib/intake/validation";
import type { FieldDef, FieldId, FieldKind } from "@/lib/intake/types";
import { Combobox } from "./combobox";
import { Field, fieldIds } from "./field";
import { RadioGroup } from "./radio-group";
import { SelectInput } from "./select-input";
import { TextareaInput } from "./textarea-input";
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
  required: boolean;
  today: string;
  onChange: (id: FieldId, value: string) => void;
  onBlur: (id: FieldId) => void;
  onSelect: (id: FieldId, value: string) => void;
};

export function FormField({
  field,
  value,
  error,
  required,
  today,
  onChange,
  onBlur,
  onSelect,
}: FormFieldProps) {
  const { helpId, errorId, describedBy } = fieldIds(
    field.id,
    field.help,
    error,
  );

  const shell = {
    id: field.id,
    label: field.label,
    required,
    help: field.help,
    helpId,
    error,
    errorId,
    describedBy,
  };

  const control = {
    id: field.id,
    value,
    required,
    invalid: Boolean(error),
    describedBy,
    onChange: (next: string) => onChange(field.id, next),
    onBlur: () => onBlur(field.id),
  };

  if (field.kind === "textarea") {
    return (
      <Field {...shell}>
        <TextareaInput {...control} />
      </Field>
    );
  }

  if (field.kind === "select") {
    return (
      <Field {...shell}>
        <SelectInput {...control} options={field.options ?? []} />
      </Field>
    );
  }

  if (field.kind === "combobox") {
    return (
      <Field {...shell}>
        <Combobox {...control} options={field.options ?? []} />
      </Field>
    );
  }

  if (field.kind === "radio") {
    return (
      <Field {...shell} asGroup>
        <RadioGroup
          name={field.id}
          options={field.options ?? []}
          value={value}
          onSelect={(next) => onSelect(field.id, next)}
        />
      </Field>
    );
  }

  const bounds = field.kind === "date" ? dateOfBirthBounds(today) : undefined;

  return (
    <Field {...shell}>
      <TextInput
        {...control}
        type={inputType(field.kind)}
        min={bounds?.min}
        max={bounds?.max}
      />
    </Field>
  );
}
