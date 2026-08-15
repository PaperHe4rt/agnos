import Link from "next/link";
import { STEPS } from "@/lib/intake/schema";
import { countRequiredAnswered } from "@/lib/intake/validation";
import type { FieldValues, StepId } from "@/lib/intake/types";

type StepRailProps = {
  step: StepId;
  values: FieldValues;
};

function BackToMainLink() {
  return (
    <Link
      href="/"
      className="rounded-field px-2 py-1 text-label font-semibold text-accent-strong underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {"<- Back"}
    </Link>
  );
}

export function StepRail({ step, values }: StepRailProps) {
  const { answered, total } = countRequiredAnswered(values);

  return (
    <>
      <div className="mb-6 lg:hidden">
        <div className="-ml-2 mb-4">
          <BackToMainLink />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-label font-semibold">
            Step {step} of {STEPS.length}
          </span>
          <span className="font-mono text-meta text-ink-soft">
            {answered} of {total} required
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={answered}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label="Required answers completed"
          className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-canvas-edge"
        >
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${(answered / total) * 100}%` }}
          />
        </div>
      </div>

      <nav aria-label="Intake steps" className="hidden lg:block">
        <div className="-ml-2 mb-3">
          <BackToMainLink />
        </div>
        <p className="font-mono text-meta uppercase tracking-[0.12em] text-ink-soft">
          Your intake
        </p>
        <ol className="mt-4 flex flex-col gap-1">
          {STEPS.map((entry) => {
            const done = entry.id < step;
            const current = entry.id === step;
            return (
              <li key={entry.id}>
                <div
                  aria-current={current ? "step" : undefined}
                  className={`flex items-baseline gap-3 rounded-field px-3 py-2.5 ${
                    current ? "bg-accent-tint" : ""
                  }`}
                >
                  <span className="font-mono text-meta text-ink-soft">
                    {done ? "✓" : entry.id}
                  </span>
                  <span
                    className={`text-label ${current ? "font-semibold text-ink" : "text-ink-muted"}`}
                  >
                    {entry.title}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
        <p className="mt-4 px-3 text-meta text-ink-soft">
          Answers stay on this device until you submit.
        </p>
      </nav>
    </>
  );
}
