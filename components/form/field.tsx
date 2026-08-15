import type { ReactNode } from "react";

export function fieldIds(id: string, help?: string, error?: string) {
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return {
    helpId,
    errorId,
    describedBy: [helpId, errorId].filter(Boolean).join(" ") || undefined,
  };
}

type FieldProps = {
  id: string;
  label: string;
  required: boolean;
  help?: string;
  helpId?: string;
  error?: string;
  errorId?: string;
  describedBy?: string;
  asGroup?: boolean;
  children: ReactNode;
};

export function Field({
  id,
  label,
  required,
  help,
  helpId,
  error,
  errorId,
  describedBy,
  asGroup,
  children,
}: FieldProps) {
  const requiredMark = required ? (
    <span aria-hidden="true" className="mr-1 text-danger">
      *
    </span>
  ) : null;

  const optionalMark = required ? null : (
    <span className="font-mono text-meta uppercase tracking-[0.12em] text-ink-soft">
      Optional
    </span>
  );

  const details = (
    <>
      {help ? (
        <p id={helpId} className="text-meta text-ink-soft">
          {help}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-label font-medium text-danger">
          {error}
        </p>
      ) : null}
    </>
  );

  if (asGroup) {
    return (
      <fieldset aria-describedby={describedBy} className="flex flex-col gap-2">
        <legend className="mb-2 flex w-full items-baseline justify-between gap-3">
          <span className="text-label font-semibold">
            {requiredMark}
            {label}
          </span>
          {optionalMark}
        </legend>
        {children}
        {details}
      </fieldset>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-label font-semibold">
          {requiredMark}
          {label}
        </label>
        {optionalMark}
      </div>
      {children}
      {details}
    </div>
  );
}
