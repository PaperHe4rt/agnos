"use client";

import { useEffect, useRef, useState } from "react";

const MIN_GAP_MS = 5_000;

export function useAnnouncement(message: string) {
  const [announced, setAnnounced] = useState("");
  const lastAt = useRef(0);

  useEffect(() => {
    if (message === announced) return;

    const wait = Math.max(0, MIN_GAP_MS - (Date.now() - lastAt.current));
    const timer = setTimeout(() => {
      lastAt.current = Date.now();
      setAnnounced(message);
    }, wait);

    return () => clearTimeout(timer);
  }, [message, announced]);

  return announced;
}
