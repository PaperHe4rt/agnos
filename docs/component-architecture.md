# Component architecture

Components are split by product. The patient form and the staff queue share tokens and conventions, not components — the two jobs are different enough that a shared "field" abstraction would have needed a prop for every difference.

## Patient side

`app/intake/[sessionId]/page.tsx` is a server component. It reads the session id from the route and computes today's date, then passes both down. Today is computed on the server so the date input's maximum matches on both render passes; a `new Date()` in the client would produce a hydration mismatch across time zones.

`intake-form.tsx` is the only stateful component in the flow. It owns the phase (`form`, `review`, `submitted`), the current step, the values, the errors, which fields have been touched, and the submit timestamp. Two counters — failed validations per field and error submits — live in refs rather than state, because nothing renders them and a ref cannot go stale between two blurs in the same tick.

Everything below it is presentational:

| Component | Responsibility |
|---|---|
| `field.tsx` | The label-or-fieldset shell around any input: required asterisk, optional marker, help text, error text, and the id wiring for `aria-describedby` |
| `form-field.tsx` | Switches on the field's `kind` and renders the right input. Throws on an unknown kind rather than silently falling back to a text box |
| `text-input`, `textarea-input`, `select-input`, `radio-group` | The plain inputs |
| `combobox.tsx` | Searchable select for language, nationality and religion. Arrow keys move, Enter picks |
| `error-summary.tsx` | Appears after a failed continue, takes focus, links to each broken field |
| `step-rail.tsx` | Four steps on desktop, a progress bar below 1024px |
| `step-footer.tsx` | Back and continue, sticky on small screens |
| `review-step.tsx` | Every answer with an edit link per section |
| `submitted-step.tsx` | Confirmation with name, date of birth, phone and the submit time |
| `save-indicator.tsx` | "Saving…", "Saved · 2s ago" or "Not saved · retrying", plus the throttled live region |

## Staff side

`app/staff/page.tsx` subscribes to the channel and passes three props down: the sessions, the current time, and the connection state. Every component below it takes data as props and knows nothing about where it came from.

That constraint is not decoration. The whole queue was built and reviewed against a fixture array of sessions before any transport existed, and swapping the fixture for the live hook later required no change to a single component.

| Component | Responsibility |
|---|---|
| `staff-queue.tsx` | The only stateful one: filter, search, density, selection, page, and the frozen sort order |
| `patient-card.tsx` | Name, status, attention flag, progress, and one line of activity |
| `queue-table.tsx` | The same information as rows, above 1280px only |
| `patient-detail.tsx` | Drawer at 1024px and above, full screen below. Fields grouped by step with a per-field timestamp, a caret on the field being typed, and a tint on values that just changed |
| `status-badge.tsx` | `StatusBadge` and `AttentionFlagBadge`. The flag renders beside a status, never instead of one |
| `connection-status.tsx` | The header pill and the banner shown when the channel is not live |
| `summary.ts` | `patientName` and `describeActivity` — the two derived strings both the card and the table need |
| `pagination.ts` | Page maths, kept pure so it could be tested without rendering anything |

`StatusBadge` takes a `pulse` prop rather than deciding for itself, because the same badge appears on a card, in a table row and in the drawer, and only the caller knows whether the patient is currently typing.

## Hooks

The hooks hold the behaviour that would otherwise bloat a component.

- **`useIntakeChannel`** — opens the event stream, keeps the session list, and exposes the connection as one of `connecting`, `live`, `reconnecting` or `offline`. Also exports `sendPatch`, the single place anything writes to the server.
- **`useIntakeSync`** — the patient's write path. Batches keystrokes into one request, and holds a failed patch until it lands so the indicator never claims a save that did not happen.
- **`useNow`** — a ticking clock. Relative timestamps have to move on their own, since nothing else re-renders the queue between events.
- **`useChangedFields`** — diffs field timestamps to find what just changed, which drives the 600ms tint. A one-second clock cannot resolve a 600ms window, so the comparison is against the previous render rather than against the current time.
- **`useAnnouncement`** — throttles live-region text to one announcement per five seconds.

## Shared

`wordmark.tsx` is the brand and an optional context label. `theme-toggle.tsx` reads the theme from the `<html>` class through `useSyncExternalStore` rather than keeping its own copy — the class is the source of truth, since a script sets it before React starts, and mirroring it into state would create two answers to the same question.
