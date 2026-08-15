# Project structure

```
app/
  page.tsx                    landing page, two entry points
  start-intake-button.tsx     creates a session id and routes to it
  layout.tsx                  fonts, metadata, theme bootstrap script
  globals.css                 every design token, light and dark
  intake/[sessionId]/
    page.tsx                  server component, passes sessionId and today
    intake-form.tsx           the whole patient flow, client side
  staff/page.tsx              the queue, subscribed to the live channel
  api/intake/
    stream/route.ts           GET, server-sent events
    events/route.ts           POST, applies a patch from the patient
components/
  form/                       field primitives and the patient screens
  staff/                      queue, cards, table, detail drawer
  theme-toggle.tsx
  wordmark.tsx
hooks/                        client-side behaviour, no markup
lib/
  intake/                     domain rules, pure and network-free
  realtime/hub.ts             in-memory session registry
docs/                         these documents
```

## Why it is arranged this way

The layout follows one rule: **nothing knows about the layer above it.**

`lib/intake` is the bottom. It holds the field schema, the validators, the status machine and the id generator. Nothing in it imports React, touches the network or reads the clock on its own — `getStatus(session, now)` takes the time as an argument, which is what makes it testable. This is where a silent bug would be most expensive, so it is where the tests are.

`lib/realtime` is the transport, and it is deliberately small: one file holding a `Map` of sessions and a `Set` of listeners. It imports types from `lib/intake` but no component imports it. If a component under `components/staff/` ever imports from `lib/realtime`, the separation has been broken.

`hooks/` is the seam between the two. `useIntakeChannel` speaks server-sent events, `useIntakeSync` debounces writes, and both hand plain data to components. Because the transport is confined here, the staff view was built and reviewed against a fixture array before any of it existed, and connecting the two later changed no component.

`components/` is split by product rather than by widget type. The front desk and the patient share a design language but not a single component, and pretending otherwise would have produced parts with a prop for every difference.

## Tests sit beside what they test

`lib/intake/validation.test.ts`, `lib/intake/status.test.ts`, `lib/realtime/hub.test.ts` and `components/staff/pagination.test.ts` live next to their source rather than in a separate tree. They cover pure functions only. There is no component or end-to-end suite. That is a deliberate limit: the logic most likely to break silently is tested, and the rendering is checked by looking at it.

## Things worth knowing before editing

`app/globals.css` contains tokens and keyframes, nothing else. No element selectors, no utility overrides. Colours are defined once in `@theme` for light and once under `.dark` for dark, so a component never needs a `dark:` variant.

`lib/intake/schema.ts` keeps `FIELDS` in step order on purpose. `validateAll` builds its error object by walking that array, and submit jumps to the step of the first key, so reordering the array would quietly change which step a failed submit lands on.
