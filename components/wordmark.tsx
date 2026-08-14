export function Wordmark({ context }: { context?: string }) {
  return (
    <div className="flex items-baseline gap-2.5">
      <span className="text-lg font-bold tracking-tight text-ink">Agnos</span>
      {context ? (
        <span className="font-mono text-meta uppercase tracking-[0.14em] text-ink-soft">
          {context}
        </span>
      ) : null}
    </div>
  );
}
