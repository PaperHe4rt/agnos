"use client";

import { useState } from "react";

const BASE =
  "h-touch w-full rounded-field border border-control bg-surface px-4 text-body " +
  "placeholder:text-ink-soft " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent " +
  "aria-invalid:border-danger aria-invalid:bg-danger-tint";

type ComboboxProps = {
  id: string;
  options: string[];
  value: string;
  required: boolean;
  invalid: boolean;
  describedBy?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
};

export function Combobox({
  id,
  options,
  value,
  required,
  invalid,
  describedBy,
  onChange,
  onBlur,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const query = value.trim().toLowerCase();
  const matches = query
    ? options.filter((option) => option.toLowerCase().includes(query))
    : options;
  const listboxId = `${id}-listbox`;

  function pick(option: string) {
    onChange(option);
    setOpen(false);
    setActive(0);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((index) =>
        Math.min(Math.max(index + step, 0), matches.length - 1),
      );
      return;
    }

    if (event.key === "Enter" && open && matches[active]) {
      event.preventDefault();
      pick(matches[active]);
      return;
    }

    if (event.key === "Escape") setOpen(false);
  }

  return (
    <div className="relative">
      <input
        id={id}
        name={id}
        type="text"
        role="combobox"
        autoComplete="off"
        value={value}
        placeholder="Type to search"
        aria-required={required}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={
          open && matches[active] ? `${id}-option-${active}` : undefined
        }
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          setOpen(false);
          onBlur();
        }}
        onKeyDown={handleKeyDown}
        className={BASE}
      />

      {open && matches.length > 0 ? (
        <div className="absolute z-10 mt-1 w-full rounded-field border border-control bg-surface py-1 shadow-card">
          <ul id={listboxId} role="listbox" className="max-h-64 overflow-auto">
            {matches.map((option, index) => (
              <li
                key={option}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={option === value}
                onMouseDown={(event) => {
                  event.preventDefault();
                  pick(option);
                }}
                onMouseEnter={() => setActive(index)}
                className={`cursor-pointer px-4 py-2.5 text-body ${
                  index === active ? "bg-accent-tint" : ""
                }`}
              >
                {option}
              </li>
            ))}
          </ul>
          <p
            aria-hidden="true"
            className="px-4 pt-2 font-mono text-meta text-ink-soft"
          >
            ↑↓ to move · enter to pick
          </p>
        </div>
      ) : null}
    </div>
  );
}
