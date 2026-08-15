# Agnos patient intake

Two screens that stay in sync. A patient fills out their details on their phone while the front desk sees each answer appear as it is typed — no refresh and no need to wait for submission.

## How to Run

```bash
pnpm install
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000).

## See both sides at once

1. Open [http://localhost:3000](http://localhost:3000) and click **Start my intake**. You’ll be taken to `/intake/<sessionId>`.
2. Copy the URL into a second window, or note the session ID.
3. Open [http://localhost:3000/staff](http://localhost:3000/staff) in the second window and place both windows side by side.
4. Start typing in the form. The staff view updates about half a second later, showing which field is being edited and the patient’s progress.

## What is in the form

Fourteen fields across four steps. Nine are required: first name, last name, date of birth, gender, phone, email, home address, preferred language, and nationality. Middle name and religion are optional.

Emergency contact details are optional as a group, but cannot be partially filled. If the patient fills in one of the three fields, the other two become required.

## Statuses the front desk sees

There are three statuses, with only one active at a time:

- **Active** — the patient is working on the form. A pulsing dot and a line such as "Typing Email · 8s ago" indicate recent activity.
- **Inactive** — no keystroke has been received for three minutes.
- **Submitted** — the form has been completed. This status is final.

There is also a `Needs help` flag that appears alongside the current status rather than replacing it. It is triggered after three failed validations on the same field or two submit attempts with remaining errors. It clears once the field is valid or the form is submitted.

Staff can therefore see combinations such as "Active · Needs help".

## Bonus features

- **Resume on the same device.** Answers survive a reload through `sessionStorage`, and the browser re-sends them so the staff view does not keep stale data.
- **Accurate save status.** Shows "Saved · 2s ago" after a successful write and "Not saved · retrying" when a write fails.
- **Attention flag.** Highlights patients who appear stuck on a field so staff can step in.
- **Table view.** On screens wider than 1280px, the card grid can switch to a denser table view.
- **Filters, search, and pagination.** Filter by status or flag, search by name, phone number, or date of birth, with twelve patients per page.
- **Dark mode.** Available from every screen. The first visit follows the system preference, and the selected theme is remembered afterward.
- **Limited motion.** Only three elements animate: the status dot, the caret on the field being typed, and a 600ms tint when a value changes. `prefers-reduced-motion` replaces the pulse with a static ring.

## Checks

```bash
pnpm test
```

```bash
pnpm run lint
```

```bash
pnpm run build
```

Tests cover the core logic: validation rules, the status machine, the session hub, and pagination. There is no component or end-to-end test suite.

## What this is not

Sessions are stored in memory inside a single Node process. **Restarting the server clears every session.** There is no database or persistent storage.

## Planning documents

- [Project structure](docs/project-structure.md)
- [Design](docs/design.md)
- [Component architecture](docs/component-architecture.md)
- [Real-time synchronisation flow](docs/realtime-sync.md)

## Stack

Next.js 16.3 (App Router, Turbopack), React 19, Tailwind CSS v4, TypeScript, and Vitest.
