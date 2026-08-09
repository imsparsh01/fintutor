# D-084 — Onboarding structured-flow PRD confirmed as proposed, build item queued

- **Tier:** 3, owner-confirmed. Confirms
  [`docs/features/onboarding/PRD.md`](../PRD.md) as proposed after D-083 unblocked it — the stage/path
  map, the `OnboardingState` persisted-state shape, and the fail-safe/loop-exit mechanics are all adopted
  as drafted, no changes requested.

## What's confirmed

- **Stage/path map** — four tracks (`fresh_starter`, `reactive_dabbler`, `habit_former`, `unclassified`),
  each with its own stage sequence ending in `complete`, grounded in BRIEF-011's already-mapped teaching
  content per profile.
- **Persisted-state shape** — a new `onboarding_states` table (`id`, `user_id` loose-ref, `track`, `stage`,
  `turns_in_stage`), modeled directly on the existing `StreakState` pattern.
- **Fail-safe mechanics** — a 4-turn budget per stage before the AI's own next message must explicitly
  offer "continue to the app," on top of the existing header-button escape hatch (unchanged from D-058).
- **The compliance note carried forward from BRIEF-011** on the `fresh_starter` → `sequencing` stage
  (fixed-order presentation risk) stays attached to that stage's copy — implementation must keep it in
  view, not treat this confirmation as clearing it.

## What's still open, not resolved by this confirmation

Per the PRD's own "Not yet written" section: exact per-stage copy (especially the compliance-sensitive
`sequencing` stage), resume-after-skip interaction, the precise `/chat` request/response shape carrying
`track`/`stage`, and whether `turns_in_stage` resets on a track change. These are implementation-time
details for whoever picks up the build item, not additional owner decisions — same "left to normal
build-time execution" pattern D-058 itself used.

## Build item queued

Added to `docs/BUILD_QUEUE.md` READY: implement the onboarding structured conversation flow per this PRD —
backend `OnboardingState` model + migration + stage-transition logic, `/chat` request/response changes to
carry `track`/`stage`, and frontend wiring in `OnboardingScreen`/`ChatThread`.

**Reversibility:** High — still no code written. This confirmation makes the design final enough to build
against, not final enough that changing it later would be costly.

**Date:** 10-Aug-2026
