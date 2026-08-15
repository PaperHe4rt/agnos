import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import { ThemeToggle } from "@/components/theme-toggle";
import { StartIntakeButton } from "./start-intake-button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-canvas-edge px-6 py-5 sm:px-10">
        <Wordmark context="Patient intake" />
        <ThemeToggle />
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-10 px-6 py-12 sm:px-10 sm:py-16">
        <div>
          <h1 className="max-w-[20ch] text-display font-bold">
            Two ways in: fill in your details, or watch them arrive.
          </h1>
          <p className="mt-4 max-w-[62ch] text-body text-ink-muted">
            Patients answer on their own phone. The front desk sees every answer
            as it is typed, with no refresh and no waiting for a submit.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <section className="flex flex-col gap-4 rounded-card border border-canvas-edge bg-surface p-6">
            <div>
              <h2 className="text-question font-semibold">
                I&apos;m a patient
              </h2>
              <p className="mt-2 text-body text-ink-muted">
                Four short steps, about six minutes. Answers save as you type.
              </p>
            </div>
            <div className="mt-auto">
              <StartIntakeButton />
            </div>
          </section>

          <section className="flex flex-col gap-4 rounded-card border border-canvas-edge bg-surface p-6">
            <div>
              <h2 className="text-question font-semibold">I work here</h2>
              <p className="mt-2 text-body text-ink-muted">
                The intake queue shows who is filling in now, who has stopped,
                and who is ready for review.
              </p>
            </div>
            <div className="mt-auto">
              <Link
                href="/staff"
                className="inline-flex h-touch items-center justify-center rounded-field border border-line px-6 font-semibold text-ink hover:bg-accent-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Open the intake queue
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
