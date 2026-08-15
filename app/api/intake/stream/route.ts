import { getSession, listSessions, subscribe } from "@/lib/realtime/hub";
import type { IntakeSession } from "@/lib/intake/types";

const HEARTBEAT_MS = 20_000;

export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("sessionId");
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let open = true;
      let unsubscribe = () => {};

      const close = () => {
        if (!open) return;
        open = false;
        clearInterval(heartbeat);
        unsubscribe();
      };

      const write = (chunk: string) => {
        if (!open) return;
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          close();
        }
      };

      const send = (event: string, data: unknown) => {
        write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      };

      const heartbeat = setInterval(() => write(": ping\n\n"), HEARTBEAT_MS);

      const snapshot: IntakeSession[] = sessionId
        ? [getSession(sessionId)].filter((s) => s !== undefined)
        : listSessions();
      send("snapshot", snapshot);

      unsubscribe = subscribe((session) => {
        if (sessionId && session.id !== sessionId) return;
        send("session", session);
      });

      request.signal.addEventListener("abort", () => {
        close();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
