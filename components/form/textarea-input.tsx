const BASE =
  "min-h-28 w-full rounded-field border border-control bg-surface px-4 py-3 text-body " +
  "placeholder:text-ink-soft " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent " +
  "aria-invalid:border-danger aria-invalid:bg-danger-tint " +
  "disabled:opacity-60";

type TextareaInputProps = {
  id: string;
  value: string;
  required: boolean;
  invalid: boolean;
  describedBy?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
};

export function TextareaInput({
  id,
  value,
  required,
  invalid,
  describedBy,
  onChange,
  onBlur,
}: TextareaInputProps) {
  return (
    <textarea
      id={id}
      name={id}
      rows={3}
      value={value}
      aria-required={required}
      aria-invalid={invalid}
      aria-describedby={describedBy}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
      className={BASE}
    />
  );
}
