"use client";

import { useEffect, useRef, useState } from "react";
import { Wordmark } from "@/components/wordmark";
import { ErrorSummary } from "@/components/form/error-summary";
import { FormField } from "@/components/form/form-field";
import { ReviewStep } from "@/components/form/review-step";
import { SaveIndicator } from "@/components/form/save-indicator";
import { StepFooter } from "@/components/form/step-footer";
import { StepRail } from "@/components/form/step-rail";
import { SubmittedStep } from "@/components/form/submitted-step";
import { useIntakeSync } from "@/hooks/useIntakeSync";
import { useNow } from "@/hooks/useNow";
import { FIELDS, STEPS, fieldsForStep, getField } from "@/lib/intake/schema";
import {
  isFieldRequired,
  validateAll,
  validateField,
  validateStep,
} from "@/lib/intake/validation";
import type {
  FieldErrors,
  FieldId,
  FieldValues,
  StepId,
} from "@/lib/intake/types";

type Phase = "form" | "review" | "submitted";

type Resume = {
  values: FieldValues;
  step: StepId;
  phase: Phase;
  submittedAt: number | null;
};

const LAST_STEP = STEPS.length as StepId;

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

export function IntakeForm({
  sessionId,
  today,
}: {
  sessionId: string;
  today: string;
}) {
  const [phase, setPhase] = useState<Phase>("form");
  const [step, setStep] = useState<StepId>(1);
  const [values, setValues] = useState<FieldValues>({});
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Set<FieldId>>(new Set());
  const [attempt, setAttempt] = useState(0);
  const [submittedAt, setSubmittedAt] = useState<number | null>(null);
  const [restored, setRestored] = useState(false);

  const failedValidations = useRef<Partial<Record<FieldId, number>>>({});
  const errorSubmits = useRef(0);

  const { save, saveState } = useIntakeSync(sessionId);
  const now = useNow(5_000);
  const storageKey = `intake:${sessionId}`;

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        const saved = JSON.parse(stored) as Resume;
        setValues(saved.values);
        setStep(saved.step);
        setPhase(saved.phase);
        setSubmittedAt(saved.submittedAt);
        save(
          { values: saved.values, submitted: saved.phase === "submitted" },
          true,
        );
      }
    } catch {}
    setRestored(true);
  }, [storageKey, save]);

  useEffect(() => {
    if (!restored) return;
    const resume: Resume = { values, step, phase, submittedAt };
    sessionStorage.setItem(storageKey, JSON.stringify(resume));
  }, [restored, storageKey, values, step, phase, submittedAt]);

  function recordValidation(nextErrors: FieldErrors, ids: FieldId[]) {
    const counts = { ...failedValidations.current };
    for (const id of ids) {
      if (nextErrors[id]) counts[id] = (counts[id] ?? 0) + 1;
      else delete counts[id];
    }
    failedValidations.current = counts;
    return counts;
  }

  const stepFields = fieldsForStep(step);
  const stepCopy = STEPS.find((entry) => entry.id === step);

  const visibleErrors: FieldErrors = {};
  for (const field of stepFields) {
    if (touched.has(field.id) && errors[field.id])
      visibleErrors[field.id] = errors[field.id];
  }

  function handleChange(id: FieldId, value: string) {
    const next = { ...values, [id]: value };
    setValues(next);
    setErrors((prev) => {
      let updated = prev;
      for (const errorId of Object.keys(prev) as FieldId[]) {
        updated = withError(updated, errorId, validateField(errorId, next));
      }
      return updated;
    });
    save({ values: next });
  }

  function handleBlur(id: FieldId) {
    const error = validateField(id, values);
    setTouched((prev) => new Set(prev).add(id));
    setErrors((prev) => withError(prev, id, error));

    const counts = recordValidation(error ? { [id]: error } : {}, [id]);
    save({ values, failedValidations: counts });
  }

  function handleSelect(id: FieldId, value: string) {
    const next = { ...values, [id]: value };
    setValues(next);
    setTouched((prev) => new Set(prev).add(id));
    setErrors((prev) => withError(prev, id, validateField(id, next)));
    save({ values: next });
  }

  function goToStep(next: StepId) {
    setPhase("form");
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

    const counts = recordValidation(
      stepErrors,
      stepFields.map((field) => field.id),
    );
    save({ values, failedValidations: counts }, true);

    if (Object.keys(stepErrors).length > 0) return;

    if (step === LAST_STEP) {
      setPhase("review");
      window.scrollTo({ top: 0 });
    } else {
      goToStep((step + 1) as StepId);
    }
  }

  function handleSubmit() {
    if (submittedAt) return;

    const allErrors = validateAll(values);
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      setTouched(new Set(FIELDS.map((field) => field.id)));
      setAttempt((count) => count + 1);

      errorSubmits.current += 1;
      save({ values, errorSubmits: errorSubmits.current }, true);

      goToStep(getField(Object.keys(allErrors)[0] as FieldId).step);
      return;
    }

    setSubmittedAt(Date.now());
    setPhase("submitted");
    save({ values, submitted: true }, true);
    window.scrollTo({ top: 0 });
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-canvas-edge px-6 py-5 sm:px-10">
        <Wordmark context="Patient intake" />
        <SaveIndicator state={saveState} now={now} />
      </header>

      <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-8 sm:px-10 lg:grid lg:grid-cols-[240px_1fr] lg:gap-12 lg:py-12">
        {phase === "form" ? <StepRail step={step} values={values} /> : <div />}

        {phase === "submitted" && submittedAt ? (
          <SubmittedStep values={values} submittedAt={submittedAt} />
        ) : null}

        {phase === "review" ? (
          <ReviewStep
            values={values}
            onEdit={goToStep}
            onSubmit={handleSubmit}
          />
        ) : null}

        {phase === "form" ? (
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
                  required={isFieldRequired(field.id, values)}
                  today={today}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onSelect={handleSelect}
                />
              ))}
            </div>

            <StepFooter
              canGoBack={step > 1}
              isLastStep={step === LAST_STEP}
              onBack={() => goToStep((step - 1) as StepId)}
            />
          </form>
        ) : null}
      </div>
    </div>
  );
}
