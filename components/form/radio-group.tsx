type RadioGroupProps = {
  name: string;
  options: string[];
  value: string;
  onSelect: (value: string) => void;
};

export function RadioGroup({ name, options, value, onSelect }: RadioGroupProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((option) => (
        <label
          key={option}
          className="flex h-touch cursor-pointer items-center gap-3 rounded-field border border-control bg-surface px-4 text-body has-checked:border-accent has-checked:bg-accent-tint has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent"
        >
          <input
            type="radio"
            name={name}
            value={option}
            checked={value === option}
            onChange={() => onSelect(option)}
            className="size-5 accent-accent"
          />
          {option}
        </label>
      ))}
    </div>
  );
}
