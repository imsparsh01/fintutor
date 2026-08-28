# BQ-128 pre-build engineering review

**Scope lock:** Build one standalone, fixture-only Portfolio prototype under `prototype/`. Cover the ten
prototype tasks in `ACCEPTANCE_MATRIX.md`, all P-01..P-32 states and D-162..D-165. Do not change production
app/backend behavior, schemas, APIs, formulas, dependencies or persistence.

## Architecture

- Plain HTML, CSS and JavaScript, matching the previously validated feature prototypes.
- All fixtures and mutations remain in JavaScript memory. Reload resets everything.
- A scenario selector and clearly separated fixture controls provide deterministic state injection.
- One mobile application shell renders overview, family, holding, Health, concentration and trend screens.
- Native dialog supplies consequence review, conflict comparison and optional-context editing.
- A visible fixture log plus ARIA live regions make state transitions inspectable.
- No dependency is introduced. No network, storage, cookie, analytics, model or service-worker API is used.

## Edge cases locked before build

- Empty, mixed, fully measured, invalid, excluded, unvalued and unclassified records remain distinct.
- Read failure is local. Offline-with-cache, offline-without-cache, stale, 409 and 401/403 use different UI.
- Account switch clears the prior subject, closes dialogs and discards a simulated late response.
- Draft validation/cancel never changes authoritative state; lost-response retry reconciles before writing.
- Delete and recategorize require consequence review; reminder failure cannot roll back a committed record.
- Health context save failure preserves the prior value; clear is explicit; no score, band or reward appears.
- Dialog focus restoration, Escape, keyboard controls, 44px targets, zoom/reflow, themes and reduced motion are
  part of the build rather than post-build decoration.

## Test contract

- Static script checks forbidden APIs, required scenario/task/state identifiers, headings, labels and files.
- Browser QA exercises every scenario, route and mutation path; checks console/DOM, focus, keyboard, light/dark,
  320/390/wide layouts, 200% text and reduced motion.
- `QA_EVIDENCE.md` must provide a PASS/FAIL row and direct evidence for every AC ID before BQ-128 closes.

## Out of scope findings

Any production discrepancy discovered while validating the fixture is recorded for a later bounded queue
item. It is not absorbed into BQ-128.
