"use client";

import { useEffect, useRef, useState } from "react";
import type { FieldId, IntakeSession } from "@/lib/intake/types";

const TINT_MS = 600;

export function useChangedFields(session: IntakeSession) {
  const seen = useRef<Partial<Record<FieldId, number>> | null>(null);
  const [changed, setChanged] = useState<FieldId[]>([]);

  useEffect(() => {
    const previous = seen.current;
    seen.current = { ...session.fieldUpdatedAt };

    if (previous === null) return;

    const fresh = (
      Object.entries(session.fieldUpdatedAt) as [FieldId, number][]
    )
      .filter(([id, at]) => previous[id] !== at)
      .map(([id]) => id);

    if (fresh.length === 0) return;

    const show = setTimeout(() => setChanged(fresh));
    const clear = setTimeout(() => setChanged([]), TINT_MS);
    return () => {
      clearTimeout(show);
      clearTimeout(clear);
    };
  }, [session]);

  return changed;
}
