const BASE =
  "h-touch w-full appearance-none rounded-field border border-control bg-surface pl-4 pr-11 text-body " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent " +
  "aria-invalid:border-danger aria-invalid:bg-danger-tint " +
  "disabled:opacity-60";

type SelectInputProps = {
  id: string;
  options: string[];
  value: string;
  required: boolean;
  invalid: boolean;
  describedBy?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
};

export function SelectInput({
  id,
  options,
  value,
  required,
  invalid,
  describedBy,
  onChange,
  onBlur,
}: SelectInputProps) {
  return (
    <div className="relative">
      <select
        id={id}
        name={id}
        value={value}
        aria-required={required}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        className={BASE}
      >
        <option value="">Select one</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <svg
        aria-hidden="true"
        viewBox="0 0 12 8"
        className="pointer-events-none absolute right-4 top-1/2 h-2 w-3 -translate-y-1/2 text-ink-soft"
      >
        <path
          d="M1 1.5 6 6.5 11 1.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
