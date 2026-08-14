type StepFooterProps = {
  answered: number;
  total: number;
  canGoBack: boolean;
  onBack: () => void;
};

export function StepFooter({ answered, total, canGoBack, onBack }: StepFooterProps) {
  return (
    <div className="sticky bottom-0 mt-8 flex items-center gap-4 border-t border-line bg-canvas px-1 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:static lg:pb-4">
      {canGoBack ? (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-touch items-center justify-center rounded-field border border-line px-5 font-semibold text-ink hover:bg-accent-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Back
        </button>
      ) : null}

      <span className="hidden font-mono text-meta text-ink-soft sm:inline">
        {answered} of {total} required answered
      </span>

      <button
        type="submit"
        className="ml-auto inline-flex h-touch items-center justify-center rounded-field bg-accent px-6 font-semibold text-white transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Continue
      </button>
    </div>
  );
}
