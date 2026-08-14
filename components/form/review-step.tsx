"use client";

import { useEffect, useRef } from "react";
import { STEPS, fieldsForStep } from "@/lib/intake/schema";
import type { FieldId, FieldValues, StepId } from "@/lib/intake/types";

type ReviewStepProps = {
  values: FieldValues;
  skipped: FieldId[];
  onEdit: (step: StepId) => void;
  onSubmit: () => void;
};

export function ReviewStep({
  values,
  skipped,
  onEdit,
  onSubmit,
}: ReviewStepProps) {
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    heading.current?.focus();
  }, []);

  return (
    <div>
      <h1 ref={heading} tabIndex={-1} className="text-display font-bold">
        Check your answers
      </h1>
      <p className="mt-3 text-body text-ink-muted">
        Change anything that looks wrong before you send it to the front desk.
      </p>

      <div className="mt-8 flex flex-col gap-6">
        {STEPS.map((step) => (
          <section
            key={step.id}
            className="rounded-card border border-canvas-edge bg-surface p-5"
          >
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-question font-semibold">{step.title}</h2>
              <button
                type="button"
                onClick={() => onEdit(step.id)}
                className="rounded-field px-2 py-1 text-label font-semibold text-accent-strong underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Edit
              </button>
            </div>

            <dl className="mt-4 flex flex-col gap-3">
              {fieldsForStep(step.id).map((field) => {
                const value = values[field.id]?.trim();
                return (
                  <div
                    key={field.id}
                    className="flex flex-col gap-0.5 sm:flex-row sm:gap-4"
                  >
                    <dt className="text-label text-ink-soft sm:w-48 sm:shrink-0">
                      {field.label}
                    </dt>
                    <dd
                      className={`text-body whitespace-pre-line ${value ? "text-ink" : "text-ink-soft"}`}
                    >
                      {value ??
                        (skipped.includes(field.id)
                          ? "Skipped"
                          : "Not answered")}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </section>
        ))}
      </div>

      <div className="sticky bottom-0 mt-8 flex items-center gap-4 border-t border-line bg-canvas px-1 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:static lg:pb-4">
        <button
          type="button"
          onClick={() => onEdit(4)}
          className="inline-flex h-touch items-center justify-center rounded-field border border-line px-5 font-semibold text-ink hover:bg-accent-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          className="ml-auto inline-flex h-touch items-center justify-center rounded-field bg-accent px-6 font-semibold text-white transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Submit my information
        </button>
      </div>
    </div>
  );
}
