"use client";

import { useState } from "react";
import { Wordmark } from "@/components/wordmark";
import { ErrorSummary } from "@/components/form/error-summary";
import { FormField } from "@/components/form/form-field";
import { StepFooter } from "@/components/form/step-footer";
import { StepRail } from "@/components/form/step-rail";
import { STEPS, fieldsForStep } from "@/lib/intake/schema";
import {
  countRequiredAnswered,
  validateField,
  validateStep,
} from "@/lib/intake/validation";
import type {
  FieldErrors,
  FieldId,
  FieldValues,
  StepId,
} from "@/lib/intake/types";

const LAST_BUILT_STEP = 2;

function withError(
  errors: FieldErrors,
  id: FieldId,
  error: string | null,
): FieldErrors {
  const next = { ...errors };
  if (error) next[id] = error;
  else delete next[id];
  return next;
}

export function IntakeForm() {
  const [step, setStep] = useState<StepId>(1);
  const [values, setValues] = useState<FieldValues>({});
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Set<FieldId>>(new Set());
  const [attempt, setAttempt] = useState(0);

  const stepFields = fieldsForStep(step);
  const stepCopy = STEPS.find((entry) => entry.id === step);
  const required = countRequiredAnswered(values, step);

  const visibleErrors: FieldErrors = {};
  for (const field of stepFields) {
    if (touched.has(field.id) && errors[field.id])
      visibleErrors[field.id] = errors[field.id];
  }

  function handleChange(id: FieldId, value: string) {
    const next = { ...values, [id]: value };
    setValues(next);

    if (errors[id])
      setErrors((prev) => withError(prev, id, validateField(id, next)));
  }

  function handleBlur(id: FieldId) {
    setTouched((prev) => new Set(prev).add(id));
    setErrors((prev) => withError(prev, id, validateField(id, values)));
  }

  function handleSelect(id: FieldId, value: string) {
    const next = { ...values, [id]: value };
    setValues(next);
    setTouched((prev) => new Set(prev).add(id));
    setErrors((prev) => withError(prev, id, validateField(id, next)));
  }

  function goToStep(next: StepId) {
    setStep(next);
    window.scrollTo({ top: 0 });
  }

  function handleContinue() {
    const stepErrors = validateStep(step, values);

    setErrors((prev) => {
      const next = { ...prev };
      for (const field of stepFields) {
        if (stepErrors[field.id]) next[field.id] = stepErrors[field.id];
        else delete next[field.id];
      }
      return next;
    });
    setTouched((prev) => {
      const next = new Set(prev);
      for (const field of stepFields) next.add(field.id);
      return next;
    });
    setAttempt((count) => count + 1);

    if (Object.keys(stepErrors).length === 0) goToStep((step + 1) as StepId);
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-canvas-edge px-6 py-5 sm:px-10">
        <Wordmark context="Patient intake" />
      </header>

      <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-8 sm:px-10 lg:grid lg:grid-cols-[240px_1fr] lg:gap-12 lg:py-12">
        <StepRail step={step} values={values} />

        {step > LAST_BUILT_STEP ? (
          <div className="rounded-card border border-canvas-edge bg-surface p-6">
            <h1 className="text-question font-semibold">Preferences</h1>
            <button
              type="button"
              onClick={() => goToStep(LAST_BUILT_STEP)}
              className="mt-6 inline-flex h-touch items-center justify-center rounded-field border border-line px-5 font-semibold text-ink hover:bg-accent-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Back
            </button>
          </div>
        ) : (
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              handleContinue();
            }}
            className="flex flex-col"
          >
            <ErrorSummary errors={visibleErrors} attempt={attempt} />

            <h1 className="text-display font-bold">{stepCopy?.question}</h1>
            <p className="mt-3 text-body text-ink-muted">{stepCopy?.intro}</p>

            <div className="mt-8 flex flex-col gap-6">
              {stepFields.map((field) => (
                <FormField
                  key={field.id}
                  field={field}
                  value={values[field.id] ?? ""}
                  error={visibleErrors[field.id]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onSelect={handleSelect}
                />
              ))}
            </div>

            <StepFooter
              answered={required.answered}
              total={required.total}
              canGoBack={step > 1}
              onBack={() => goToStep((step - 1) as StepId)}
            />
          </form>
        )}
      </div>
    </div>
  );
}
