"use client";

import { useEffect, useState } from "react";

// Relative timestamps have to move on their own — between events nothing else
// re-renders the queue, and a frozen "8s ago" is a lie within a minute.
export function useNow(intervalMs = 1_000) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
}
