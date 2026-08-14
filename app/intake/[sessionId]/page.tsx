import { Wordmark } from "@/components/wordmark";

export default async function IntakePage({
  params,
}: PageProps<"/intake/[sessionId]">) {
  const { sessionId } = await params;

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-canvas-edge px-6 py-5 sm:px-10">
        <Wordmark context="Patient intake" />
      </header>
      <main className="mx-auto w-full max-w-2xl px-6 py-12 sm:px-10">
        <h1 className="text-display font-bold">Your intake</h1>
        <p className="mt-4 text-body text-ink-muted">
          The form is not built yet. This session is{" "}
          <span className="font-mono">{sessionId}</span>.
        </p>
      </main>
    </div>
  );
}
