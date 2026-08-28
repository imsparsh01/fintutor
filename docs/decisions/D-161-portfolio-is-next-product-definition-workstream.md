# D-161 — Portfolio and Portfolio Health is the next product-definition workstream

- **Tier:** 3, owner-decided sequencing under D-148.
- **Date:** 29-Aug-2026
- **Traces / builds on:** D-013, D-031, D-059, D-065, D-076, D-089, D-096, D-104, D-106,
  D-109..D-112, D-125, D-145, D-148 and the completed Onboarding workstream.

## Decision

The owner approved **Portfolio and Portfolio Health**, rank 6 (score 78) in the D-148 portfolio audit, as
the next product-definition workstream and set the goal to design, build and test its prototype completely
end to end.

The approved bounded plan is:

1. **BQ-125:** reconcile the shipped Portfolio, Portfolio Health and three persistent family sections into
   one current PRD, journey and complete state matrix.
2. **BQ-126:** consolidate functional, data, content, privacy, accessibility and recovery contracts.
3. **BQ-127:** map requirements to acceptance tests and route genuine unresolved forks through the decision
   protocol.
4. **BQ-128:** design and build a controlled-data clickable prototype, then complete exhaustive agent QA.
5. **BQ-129:** owner walkthrough and PASS / REVISE / PARK / ESCALATE disposition.

## Why

The implementation already contains Portfolio allocation, family navigation, Portfolio Health, category
concentration, trend teaching, and the Investments/Loans/Insurance sections. The constraining uncertainty is
semantic and experiential: whether a user can distinguish records from rupee weighting, unknown from zero,
coverage measurement from personal judgment, and factual structure from advice. This work validates the
approved MVP rather than adding a capability.

## Boundaries

- Definition and fixture prototype only. No production `app/`, `backend/`, schema, API, dependency,
  persistence or money-calculation change.
- MVP holding families remain Investments, Loans and Insurance. Real estate, Cash & bank and Alternatives
  remain deferred.
- D-065 stays fixed: three family totals, never a synthetic signed net-worth figure.
- P2/P6/P8/P9/P10/P11 stay fixed: never advise or rank; product names stay out of the model; every family is
  reachable; teaching never gates access; financial figures receive no valence treatment.
- Existing calculations are evidence to reconcile, not permission to silently repair or redefine them.
  Any formula, financial-data, privacy or standing-principle fork stops for the owner in BQ-127.
- Production changes require separately bounded build items after BQ-129 PASS.

## Reversibility

High. This creates documentation and a fixture-only prototype without changing production behavior or data.

## Disposition

READY → BQ-125. BQ-126..BQ-129 follow in order.
