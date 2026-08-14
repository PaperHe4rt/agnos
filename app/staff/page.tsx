import { Wordmark } from "@/components/wordmark";

export default function StaffPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-canvas-edge px-6 py-5 sm:px-10">
        <Wordmark context="Front desk" />
      </header>
      <main className="mx-auto w-full max-w-5xl px-6 py-12 sm:px-10">
        <h1 className="text-display font-bold">Intake queue</h1>
        <p className="mt-4 text-body text-ink-muted">
          The queue is not built yet. Patients who open an intake link will
          appear here once real-time sync is in place.
        </p>
      </main>
    </div>
  );
}
