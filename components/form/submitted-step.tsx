"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { FieldValues } from "@/lib/intake/types";

function formatDate(value?: string) {
  if (!value) return "Not answered";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

export function SubmittedStep({
  values,
  submittedAt,
}: {
  values: FieldValues;
  submittedAt: number;
}) {
  const name = [values.firstName, values.middleName, values.lastName]
    .filter(Boolean)
    .join(" ");

  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    heading.current?.focus();
  }, []);

  const time = new Date(submittedAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  return (
    <div className="rounded-card border border-canvas-edge bg-surface p-6 sm:p-8">
      <span
        aria-hidden="true"
        className="flex size-10 items-center justify-center rounded-full bg-status-active text-lg text-white"
      >
        ✓
      </span>

      <h1 ref={heading} tabIndex={-1} className="mt-5 text-display font-bold">
        You're checked in
      </h1>
      <p className="mt-3 text-body text-ink-muted">
        A member of the front desk has your details. They&apos;ll call you
        shortly.
      </p>
      <p className="mt-1 font-mono text-meta text-ink-soft">Submitted {time}</p>

      <dl className="mt-8 flex flex-col gap-3 border-t border-line pt-6">
        <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
          <dt className="text-label text-ink-soft sm:w-40 sm:shrink-0">Name</dt>
          <dd className="text-body">{name || "Not answered"}</dd>
        </div>
        <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
          <dt className="text-label text-ink-soft sm:w-40 sm:shrink-0">
            Date of birth
          </dt>
          <dd className="text-body">{formatDate(values.dateOfBirth)}</dd>
        </div>
        <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
          <dt className="text-label text-ink-soft sm:w-40 sm:shrink-0">
            Phone
          </dt>
          <dd className="text-body">{values.phone || "Not answered"}</dd>
        </div>
      </dl>

      <div className="mt-8 border-t border-line pt-6">
        <Link
          href="/"
          className="inline-flex h-touch items-center justify-center rounded-field bg-accent px-6 font-semibold text-white transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Back to main page
        </Link>
      </div>
    </div>
  );
}
