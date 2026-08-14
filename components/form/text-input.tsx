const BASE =
  "h-touch w-full rounded-field border border-control bg-surface px-4 text-body " +
  "placeholder:text-ink-soft " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent " +
  "aria-invalid:border-danger aria-invalid:bg-danger-tint " +
  "disabled:opacity-60";

type TextInputProps = {
  id: string;
  type: "text" | "tel" | "email" | "date";
  value: string;
  required: boolean;
  invalid: boolean;
  describedBy?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
};

export function TextInput({
  id,
  type,
  value,
  required,
  invalid,
  describedBy,
  placeholder,
  onChange,
  onBlur,
}: TextInputProps) {
  return (
    <input
      id={id}
      name={id}
      type={type}
      value={value}
      placeholder={placeholder}
      aria-required={required}
      aria-invalid={invalid}
      aria-describedby={describedBy}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
      className={BASE}
    />
  );
}
