"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SessionPatch } from "@/lib/realtime/hub";
import { sendPatch } from "./useIntakeChannel";

const DEBOUNCE_MS = 400;
const RETRY_MS = 3_000;

export type SaveState =
  | { status: "idle" }
  | { status: "saving" }
  | { status: "saved"; at: number }
  | { status: "failed" };

function mergePatch(current: SessionPatch, next: SessionPatch): SessionPatch {
  return {
    ...current,
    ...next,
    values: { ...current.values, ...next.values },
  };
}

// Batches keystrokes into one request and keeps a failed patch until it lands,
// so the indicator never says "saved" for something the server never got.
export function useIntakeSync(sessionId: string) {
  const [saveState, setSaveState] = useState<SaveState>({ status: "idle" });
  const pending = useRef<SessionPatch>({});
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const flush = useCallback(async () => {
    const patch = pending.current;
    pending.current = {};
    if (Object.keys(patch).length === 0) return;

    setSaveState({ status: "saving" });
    if (await sendPatch(sessionId, patch)) {
      setSaveState({ status: "saved", at: Date.now() });
      return;
    }

    // Anything typed while the request was in flight is newer, so it wins.
    pending.current = mergePatch(patch, pending.current);
    setSaveState({ status: "failed" });
  }, [sessionId]);

  // The retry is scheduled from the failed state rather than from inside flush,
  // which would have to call itself.
  useEffect(() => {
    if (saveState.status !== "failed") return;
    const retry = setTimeout(() => void flush(), RETRY_MS);
    return () => clearTimeout(retry);
  }, [saveState, flush]);

  const save = useCallback(
    (patch: SessionPatch, immediate = false) => {
      pending.current = mergePatch(pending.current, patch);
      clearTimeout(timer.current);

      if (immediate) {
        void flush();
        return;
      }
      timer.current = setTimeout(() => void flush(), DEBOUNCE_MS);
    },
    [flush],
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  return { save, saveState };
}
