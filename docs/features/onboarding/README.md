# Onboarding and first-action handoff

**Workstream:** D-158 / BQ-120..BQ-124

**Current gate:** BQ-121 contracts complete; acceptance/decision routing next

**Production status:** v2 is shipped; this folder now distinguishes the current contract from superseded
legacy material. No production change is authorised by this package.

## Current authority map

Read these files in this order:

1. `CURRENT_PRD.md` — current product purpose, boundaries and observable success.
2. `JOURNEY_AND_STATES.md` — complete journey and state/recovery matrix.
3. `CONTRACTS.md` — functional, API, content, privacy, accessibility, progression and failure contracts.
4. `ASSESSMENT_V2.md` — approved question vocabulary and normalized values.
5. `decisions/D-118-five-axis-onboarding-assessment-contract.md` — five-axis product decision.
6. `decisions/D-119-assessment-v2-persistence-privacy-package.md` — eligibility, persistence and privacy.
7. `../../decisions/D-126-optional-guided-onboarding-handoff.md` — optional first-action handoff.

`PRD.md` documents the shipped legacy four-track conversation and is superseded for new users by D-118 and
D-119. `docs/ux/journeys/onboarding.md` also describes that older baseline-capture journey; it is historical,
not the current v2 experience. Neither file is silently rewritten because they remain useful provenance.

## Workstream gates

- BQ-120: current PRD, journey and state matrix.
- BQ-121: functional/content/privacy/accessibility/failure contracts.
- BQ-122: acceptance matrix and decision register.
- BQ-123: controlled-fixture prototype and exhaustive agent QA.
- BQ-124: owner validation and disposition.

## Current reconciliation result

The shipped v2 path substantially matches D-118/D-119/D-126: five optional normalized questions, explicit
18+ acknowledgement, per-question skip, global exit, deterministic progress, a user-chosen handoff, legacy
grandfathering, cross-device backend authority, and view/change/clear controls.

Two owner boundaries are deliberately open for BQ-122. First, when the backend is unavailable for a genuinely
new account with no authoritative or cached handled state, the shipped UI cannot start or globally handle the
assessment and therefore cannot enter the app. Granting access without the required eligibility acknowledgement
would reinterpret D-119; trapping the user conflicts with the ungated/fail-safe product direction. The
prototype must not silently choose either behavior before owner ruling. Second, global exit currently earns
less total progression than individually handling all five prompts, which conflicts with disclosure-equivalence
intent and cannot be retuned after live data without owner approval.
