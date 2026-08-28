# D-158 — Onboarding and first-action handoff is the next product-definition workstream

- **Tier:** 3, owner-decided sequencing under D-148.
- **Date:** 28-Aug-2026
- **Traces / builds on:** D-118, D-119, D-125, D-126, D-148, D-156/D-157 and BQ-119.

## Decision

The owner approved **Onboarding and first-action handoff**, rank 5 (score 78) in the D-148 portfolio audit,
as the next product-definition deep dive after Home received PASS.

The approved bounded plan is:

1. **BQ-120:** reconcile the shipped v2 assessment, legacy path and first-action handoff into one current PRD,
   journey and complete state matrix.
2. **BQ-121:** consolidate functional, content, privacy, accessibility, progression and failure contracts.
3. **BQ-122:** map requirements to acceptance tests and route every genuine unresolved fork through the
   decision protocol.
4. **BQ-123:** build a controlled-fixture clickable prototype and complete agent-led QA across the critical
   journeys and states.
5. **BQ-124:** owner walkthrough and PASS / REVISE / PARK / ESCALATE disposition.

## Why

Onboarding is next in the approved ranking. It is already one of the best-documented and most extensively
tested backend workstreams, so the remaining uncertainty is experiential: whether eligibility, optionality,
interruption/resume, legacy invitation, context controls and the first-action handoff feel like one simple,
safe system. This work validates the already-approved MVP rather than adding a new capability.

## Boundaries

- Definition and fixture prototype only. No production `app/`, `backend`, schema, API, dependency or
  money-logic change.
- D-118/D-119 remain fixed: five optional normalized axes; no amounts, account details, holdings or financial
  history; skipped values are unknown rather than inferred.
- D-126 remains fixed: the first action is optional and chosen by the user; financial disclosure never gates
  app access.
- Existing users retain grandfathered access and are never forced through v2.
- Progression treatment cannot reward disclosure or derive status from financial circumstances.
- Typed free-form classification, if represented, remains inside the already-approved narrow privacy boundary;
  the fixture itself performs no model or network call.
- Production changes require separately bounded build items after BQ-124 PASS.

## Reversibility

High. This creates documentation and a fixture-only prototype. It does not migrate data or change production
behaviour.

## Disposition

READY → BQ-120. BQ-121..BQ-124 follow in order.
