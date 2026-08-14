"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { newSessionId } from "@/lib/intake/session";

export function StartIntakeButton() {
  const router = useRouter();
  const [starting, setStarting] = useState(false);

  return (
    <button
      type="button"
      disabled={starting}
      onClick={() => {
        setStarting(true);
        router.push(`/intake/${newSessionId()}`);
      }}
      className="inline-flex h-touch items-center justify-center rounded-field bg-accent px-6 font-semibold text-white transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-70"
    >
      {starting ? "Opening…" : "Start my intake"}
    </button>
  );
}
