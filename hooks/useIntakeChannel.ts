"use client";

import { useEffect, useState } from "react";
import type { ConnectionState, IntakeSession } from "@/lib/intake/types";
import type { SessionPatch } from "@/lib/realtime/hub";

const MIN_RETRY_MS = 1_000;
const MAX_RETRY_MS = 30_000;
const OFFLINE_AFTER_FAILURES = 3;

export function useIntakeChannel(sessionId?: string) {
  const [sessions, setSessions] = useState<IntakeSession[]>([]);
  const [connection, setConnection] = useState<ConnectionState>("connecting");

  useEffect(() => {
    const url = sessionId
      ? `/api/intake/stream?sessionId=${encodeURIComponent(sessionId)}`
      : "/api/intake/stream";

    let source: EventSource | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let failures = 0;
    let stopped = false;

    const connect = () => {
      source = new EventSource(url);

      source.addEventListener("snapshot", (event) => {
        setSessions(JSON.parse(event.data));
      });

      source.addEventListener("session", (event) => {
        const session: IntakeSession = JSON.parse(event.data);
        setSessions((current) => [
          ...current.filter((s) => s.id !== session.id),
          session,
        ]);
      });

      source.onopen = () => {
        failures = 0;
        setConnection("live");
      };

      source.onerror = () => {
        source?.close();
        if (stopped) return;

        failures += 1;
        setConnection(
          failures >= OFFLINE_AFTER_FAILURES ? "offline" : "reconnecting",
        );
        retryTimer = setTimeout(
          connect,
          Math.min(MIN_RETRY_MS * 2 ** (failures - 1), MAX_RETRY_MS),
        );
      };
    };

    connect();

    return () => {
      stopped = true;
      clearTimeout(retryTimer);
      source?.close();
    };
  }, [sessionId]);

  return { sessions, connection };
}

export async function sendPatch(sessionId: string, patch: SessionPatch) {
  try {
    const response = await fetch("/api/intake/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, ...patch }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
