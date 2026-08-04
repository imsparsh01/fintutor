# FinTutor — UX working folder

This is where UX execution-level artifacts live: user journey specs and screen wireframes. It's
downstream of two files that stay elsewhere and are NOT duplicated here:

- **`docs/PRODUCT_PRINCIPLES.md`** — the standing tests a UX decision is checked against (P1, P2, P4, P6,
  P7). If a journey or wireframe here implies a new principle, or conflicts with an existing one, that's a
  decision — write it up in `docs/decisions/`, not inline in a wireframe file.
- **`PROJECT_SPEC.md`** §4 — what's actually in MVP scope. A journey/wireframe describing something not
  in §4 is speculative, not a spec — flag it rather than treating it as settled.

## What goes where

- **`journeys/`** — one file per user journey (e.g. onboarding, add-a-holding, view-consolidated). A
  journey spec describes the step-by-step flow a user takes through the app for one goal — screens
  touched, decisions the user makes, what happens on each path. Written from an already-decided shape
  (a DECISION_LOG entry, a BRIEF, or shipped behavior) — not invented ahead of one. See `journeys/README.md`.
- **`wireframes/`** — one file per screen (or a tightly related group). No design-tool integration exists
  in this repo, so wireframes are structured text specs (purpose, key elements, states — loading/empty/
  error/populated), not images. See `wireframes/README.md`.

## What this folder is NOT for

- Design tokens (colors, spacing, typography) — those are code, not documentation. See `app/design/`.
- Gamification/UX principle decisions — those go through `DECISION_PROTOCOL.md` like any other decision
  and land in `docs/decisions/` + a `PRODUCT_PRINCIPLES.md` update if they produce a reusable test (see
  D-060, D-061, P7 for the pattern).
