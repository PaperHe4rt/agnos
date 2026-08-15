"use client";

import { useEffect, useRef } from "react";
import { STEPS, fieldsForStep } from "@/lib/intake/schema";
import {
  formatDateOfBirth,
  formatRelativeTime,
  getAttentionFlag,
  getProgress,
  getStatus,
} from "@/lib/intake/status";
import type { FieldDef, FieldValues, IntakeSession } from "@/lib/intake/types";
import { AttentionFlagBadge, StatusBadge } from "./status-badge";
import { describeActivity, patientName } from "./summary";

type PatientDetailProps = {
  session: IntakeSession;
  now: number;
  onClose: () => void;
};

function stepSummary(
  fields: FieldDef[],
  values: FieldValues,
  submitted: boolean,
) {
  const answered = fields.filter((f) => values[f.id]?.trim()).length;
  if (submitted) return `${answered} of ${fields.length} answered`;
  if (answered === 0) return "Not started";
  if (answered === fields.length) return "Complete";
  return `In progress · ${answered} of ${fields.length}`;
}

export function PatientDetail({ session, now, onClose }: PatientDetailProps) {
  const closeButton = useRef<HTMLButtonElement>(null);
  const submitted = session.submittedAt !== null;
  const { answered, total } = getProgress(session);

  useEffect(() => {
    closeButton.current?.focus();
  }, [session.id]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-10 bg-ink/30 lg:hidden"
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-label={`${patientName(session.values)} — intake detail`}
        className="fixed inset-0 z-20 flex flex-col overflow-y-auto border-line bg-surface lg:left-auto lg:w-104 lg:border-l"
      >
        <div className="flex items-start justify-between gap-4 border-b border-canvas-edge px-5 py-4">
          <div>
            <h2 className="text-question font-semibold">
              {patientName(session.values)}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <StatusBadge status={getStatus(session, now)} />
              <AttentionFlagBadge flag={getAttentionFlag(session)} />
            </div>
            <p className="mt-2 text-meta text-ink-muted">
              {describeActivity(session, now)} · {answered}/{total} answered
            </p>
          </div>
          <button
            ref={closeButton}
            type="button"
            onClick={onClose}
            className="inline-flex h-touch w-touch shrink-0 items-center justify-center rounded-field border border-line text-ink hover:bg-accent-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <span aria-hidden="true">✕</span>
            <span className="sr-only">Close patient detail</span>
          </button>
        </div>

        <div className="flex flex-col gap-6 px-5 py-5">
          {STEPS.map((step) => {
            const fields = fieldsForStep(step.id);
            return (
              <section key={step.id}>
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-label font-semibold uppercase tracking-[0.12em] text-ink-soft">
                    {step.title}
                  </h3>
                  <span className="text-meta text-ink-soft">
                    {stepSummary(fields, session.values, submitted)}
                  </span>
                </div>

                <dl className="mt-3 flex flex-col gap-3">
                  {fields.map((field) => {
                    const value = session.values[field.id]?.trim();
                    const updatedAt = session.fieldUpdatedAt[field.id];
                    const shown =
                      field.id === "dateOfBirth" && value
                        ? formatDateOfBirth(value)
                        : value;

                    return (
                      <div key={field.id} className="flex flex-col gap-0.5">
                        <dt className="text-meta text-ink-soft">
                          {field.label}
                        </dt>
                        <dd className="flex items-baseline justify-between gap-3">
                          <span
                            className={`text-body ${shown ? "text-ink" : "text-ink-soft"}`}
                          >
                            {shown || "Not answered"}
                          </span>
                          {updatedAt ? (
                            <span className="shrink-0 font-mono text-meta text-ink-soft">
                              {formatRelativeTime(updatedAt, now)}
                            </span>
                          ) : null}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
