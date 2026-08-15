"use client";

import { useEffect, useRef } from "react";
import { getField } from "@/lib/intake/schema";
import type { FieldErrors, FieldId } from "@/lib/intake/types";

type ErrorSummaryProps = {
  errors: FieldErrors;
  attempt: number;
};

export function ErrorSummary({ errors, attempt }: ErrorSummaryProps) {
  const ref = useRef<HTMLDivElement>(null);
  const ids = Object.keys(errors) as FieldId[];

  useEffect(() => {
    if (attempt > 0) ref.current?.focus();
  }, [attempt]);

  if (ids.length === 0) return null;

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="alert"
      className="mb-6 rounded-card border border-danger bg-danger-tint p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
    >
      <p className="text-label font-semibold text-danger">
        {ids.length === 1
          ? "Fix 1 answer to continue"
          : `Fix ${ids.length} answers to continue`}
      </p>
      <ul className="mt-2 flex flex-col gap-1">
        {ids.map((id) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className="text-label text-ink underline underline-offset-2"
            >
              {getField(id).label} — {errors[id]}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
