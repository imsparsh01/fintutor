# Scenario and focused-explorer suite

**Workstream:** D-166 / BQ-130..BQ-134

**Current gate:** BQ-130..BQ-134 complete; owner PASS recorded in D-172 and `VALIDATION_RESULT.md`

**Production reconciliation:** BQ-135 audit through BQ-140 backend-authoritative candidate provenance
complete. `PRODUCTION_RECONCILIATION.md` maps the remaining dependency-ordered BQ-141..BQ-144
sequence; production parity is not yet achieved.

**Production status:** A broad first implementation is shipped. This package reconciles and validates the
coherent end-to-end product before any production reconciliation is authorised.

## Current authority map

1. `PRD.md` — current purpose, first-principles model, suite boundary and observable success.
2. `JOURNEY_AND_STATES.md` — complete journey, inventory and state/recovery matrix.
3. `CONTRACTS.md` — binding formula, provenance, lifecycle, privacy, content, recovery and accessibility rules.
4. D-166 — approved workstream sequence and bounded BQ-130..BQ-134 plan.
5. D-172 / `VALIDATION_RESULT.md` — owner final PASS; controlled package frozen at `e3b8543`.
6. D-106/D-108 — five scenario directions, user-owned rates and editable source-labelled prefills.
7. D-130 — accessible-amount-only emergency runway.
8. D-014/D-068 — loan prepayment-versus-investing focused explorer.
9. D-066/D-069/D-103 — ESOP exercise-cost focused explorer.
10. D-070/D-112/D-145 — 80C unused-room focused explorer.
11. D-131/D-132/D-145 — user-authored household-support term-insurance scenarios.
12. D-117 — scenario completion progression cap and financial-outcome independence.

## Workstream gates

- BQ-130: current PRD, journey and complete state matrix.
- BQ-131: functional/money/content/privacy/accessibility/recovery contracts — complete.
- BQ-132: acceptance matrix and owner-only decisions — complete under D-167..D-171.
- BQ-133: controlled-fixture clickable prototype and exhaustive agent QA — complete.
- BQ-134: owner validation and disposition — PASS.

## Reconciliation warning

The shipped app is evidence, not automatically the final contract. The current implementation has material
gaps around stale results, partial/failed prefills, account-transition request races, integrated interaction,
accessibility coverage and term components currently defaulting selected contrary to D-132. No production
repair is authorised by BQ-130/BQ-131.
