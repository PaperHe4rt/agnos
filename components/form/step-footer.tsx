type StepFooterProps = {
  canGoBack: boolean;
  isLastStep: boolean;
  onBack: () => void;
};

export function StepFooter({ canGoBack, isLastStep, onBack }: StepFooterProps) {
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

      <button
        type="submit"
        className="ml-auto inline-flex h-touch items-center justify-center rounded-field bg-accent px-6 font-semibold text-on-accent hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {isLastStep ? "Review answers" : "Continue"}
      </button>
    </div>
  );
}
