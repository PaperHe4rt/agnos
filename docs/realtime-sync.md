# Real-time synchronisation flow

## What happens when a patient types

```
keystroke
  → local state updates, the field re-renders immediately
  → useIntakeSync queues a patch and waits 400ms
  → POST /api/intake/events
  → the route drops unknown keys and clamps the values
  → hub.applyPatch merges, stamps the server clock, stores
  → the hub calls every listener
  → each open stream writes a `session` event
  → useIntakeChannel replaces that session in its list
  → the staff card re-renders
```

The debounce is what keeps a keystroke from becoming a request. A patient typing a sentence sends one patch when they pause, not forty.

There is no separate "typing" signal. Every patch moves `lastKeystrokeAt`, and a 400ms debounce keeps an actively typing patient comfortably inside the 30-second window that drives the pulsing dot.

## Connecting

The staff screen opens `GET /api/intake/stream`. The server replies with a `snapshot` event carrying every current session, then one `session` event per change from then on. Adding `?sessionId=` narrows the stream to a single patient.

A comment line goes out every 20 seconds. Proxies close connections that have been silent for a while, and a comment costs nothing and resets their timer.

Each connection cleans itself up when the request aborts, and also when a write throws — a dropped connection can surface either way, and a listener that outlives its request would throw on every later broadcast.

## Status is derived, never stored

The server stores timestamps and counters. It never stores the word "active".

```
submitted   submittedAt is set. Terminal, and it wins over everything else.
inactive    no keystroke for 3 minutes
active      anything else
```

`isTyping` is separate from status: a keystroke within the last 30 seconds. It drives the pulsing dot and the "Typing Email · 8s ago" line, not the status itself.

The attention flag is derived the same way, from a count of failed validations per field and a count of failed submits. It is additive — staff read "Active · Needs help", never "Needs help" on its own.

Deriving these on the client means the display keeps moving between events. A `useNow` clock ticks once a second, so a card slides from "active" to "inactive" three minutes after the last keystroke without the server sending anything.

## When the connection breaks

The hook doesn't rely on `EventSource`'s built-in retry, which is silent and gives the interface no state to show. On an error it closes the stream itself, then reconnects with a backoff from one second up to thirty, reporting `reconnecting` and switching to `offline` after three consecutive failures.

The staff header shows this as a pill, and anything other than `live` also raises a banner. The queue never implies it is current when it is not.

The patient's writes fail differently. A failed POST keeps the patch in memory, shows "Not saved · retrying", and tries again every three seconds. Anything typed while a request was in flight is merged on top, so the newest answer wins. When a retry succeeds the indicator returns to "Saved".

## Resuming

Answers are mirrored into `sessionStorage` under the session id. A reload restores the values, the step and the phase, then pushes the whole set back to the server. That second part matters: the hub is in memory, so if the server restarted while the patient was away, the queue would otherwise show a session that no longer exists.

## Why server-sent events rather than WebSockets

The data only flows one way. The server pushes to the staff screen; the patient writes with an ordinary POST. A WebSocket would give a second, redundant channel for the direction that already works.

The practical argument is stronger. Next's route handlers cannot upgrade a connection, so WebSockets would mean running a custom server alongside the framework, losing the built-in build and start path. Server-sent events are a plain HTTP response with a streaming body, which route handlers do natively — no new dependency, no separate process, and reconnection semantics that already exist in the browser.

There are real costs. Server-sent events carry text only, there is no client-to-server channel on the same connection, and over HTTP/1.1 a browser allows just six connections per origin — a limit that disappears under HTTP/2, which multiplexes them. None of it binds here: one screen holds one stream, the payload is JSON, and writes have a perfectly good POST endpoint.

## Why not a serverless host

The session hub is a `Map` inside one Node process. On a serverless platform each instance has its own memory, so a patient's POST can land on one instance while the front desk's stream is held open by another, and the staff screen goes quiet with no error to show for it. It would work in development and fail in production, which is the worst failure mode available.

Hence a single-instance Node host with one replica. The same reasoning means the replica count is not a tuning knob — raising it breaks the app.

## Limits

**A restart clears everything.** The hub is memory, not a database. Sessions are also swept after two hours of inactivity.

**Nothing authenticates a session id.** Anyone who knows one can write to it. Acceptable for an assignment, not for a clinic.

**Last write wins, per field.** Two devices editing the same session would overwrite each other. The design assumes one patient on one device, which is what the resume flow supports.

**The heartbeat is unproven behind a real proxy.** It is correct in principle and was not observed surviving a twenty-second idle behind a production proxy locally.
