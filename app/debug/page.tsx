"use client";

import { useState } from "react";
import { sendPatch, useIntakeChannel } from "@/hooks/useIntakeChannel";

const SESSION_ID = "debug001";

export default function DebugPage() {
  const { sessions, connection } = useIntakeChannel();
  const [firstName, setFirstName] = useState("");

  return (
    <main className="flex flex-col gap-4 p-6">
      <p className="font-mono text-meta uppercase tracking-[0.12em] text-ink-soft">
        Channel · {connection}
      </p>

      <label htmlFor="debug-first-name" className="text-label font-semibold">
        First name
      </label>
      <input
        id="debug-first-name"
        value={firstName}
        onChange={(event) => {
          setFirstName(event.target.value);
          sendPatch(SESSION_ID, { values: { firstName: event.target.value } });
        }}
        className="h-touch w-72 rounded-field border border-control bg-surface px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      />

      <button
        type="button"
        onClick={() => sendPatch(SESSION_ID, { submitted: true })}
        className="h-touch w-40 rounded-field bg-accent font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Submit
      </button>

      <pre className="overflow-x-auto rounded-card border border-line bg-surface p-4 font-mono text-meta">
        {JSON.stringify(sessions, null, 2)}
      </pre>
    </main>
  );
}
