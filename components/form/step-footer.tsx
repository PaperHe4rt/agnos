type StepFooterProps = {
  answered: number;
  total: number;
  canGoBack: boolean;
  isLastStep: boolean;
  onBack: () => void;
  onSkip?: () => void;
};

export function StepFooter({
  answered,
  total,
  canGoBack,
  isLastStep,
  onBack,
  onSkip,
}: StepFooterProps) {
  return (
    <div className="sticky bottom-0 mt-8 flex flex-wrap items-center gap-4 border-t border-line bg-canvas px-1 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:static lg:pb-4">
      {canGoBack ? (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-touch items-center justify-center rounded-field border border-line px-5 font-semibold text-ink hover:bg-accent-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Back
        </button>
      ) : null}

      {total > 0 ? (
        <span className="hidden font-mono text-meta text-ink-soft sm:inline">
          {answered} of {total} required answered
        </span>
      ) : null}

      {onSkip ? (
        <button
          type="button"
          onClick={onSkip}
          className="rounded-field px-2 py-1 text-label font-semibold text-accent-strong underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Skip this step
        </button>
      ) : null}

      <button
        type="submit"
        className="ml-auto inline-flex h-touch items-center justify-center rounded-field bg-accent px-6 font-semibold text-white transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {isLastStep ? "Review answers" : "Continue"}
      </button>
    </div>
  );
}
