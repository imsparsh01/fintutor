# Onboarding and first-action handoff

**Workstream:** D-158 / BQ-120..BQ-124

**Current gate:** BQ-124 complete; owner PASS recorded and package frozen at prototype commit `1bde4b1`

**Production status:** v2 is shipped; this folder now distinguishes the current contract from superseded
legacy material. No production change is authorised by this package.

## Current authority map

Read these files in this order:

1. `CURRENT_PRD.md` — current product purpose, boundaries and observable success.
2. `JOURNEY_AND_STATES.md` — complete journey and state/recovery matrix.
3. `CONTRACTS.md` — functional, API, content, privacy, accessibility, progression and failure contracts.
4. `ACCEPTANCE_MATRIX.md` — stable acceptance IDs, full coverage map and prototype/validation tasks.
5. `DECISION_REGISTER.md` — preserved rules, bounded fixture mechanics and owner briefs O-ONB-1/O-ONB-2.
6. `prototype/` — nine-scenario controlled-data clickable prototype.
7. `QA_EVIDENCE.md` — exhaustive BQ-123 agent evidence and repaired findings.
8. `VALIDATION_RESULT.md` — owner PASS and validation boundary.
9. `ASSESSMENT_V2.md` — approved question vocabulary and normalized values.
10. `decisions/D-118-five-axis-onboarding-assessment-contract.md` — five-axis product decision.
11. `decisions/D-119-assessment-v2-persistence-privacy-package.md` — eligibility, persistence and privacy.
12. `../../decisions/D-126-optional-guided-onboarding-handoff.md` — optional first-action handoff.

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

D-159 resolves new-user backend outage with a subject-scoped pending acknowledgement and strictly limited
offline Home until authoritative sync. D-160 resolves progression equivalence by giving every initial v2 path
only the once-per-version onboarding-handled milestone. BQ-123 realized and exhaustively tested both outcomes;
the owner approved the complete tested package in BQ-124. Production implementation remains separately bounded.
