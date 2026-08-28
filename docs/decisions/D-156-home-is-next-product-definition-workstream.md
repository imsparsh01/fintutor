# D-156 - Home and consolidated experience is the next product-definition workstream

- **Tier:** 3, owner-decided sequencing under D-148.
- **Date:** 28-Aug-2026
- **Traces / builds on:** D-148, D-104, D-111, D-152, BQ-117, P10 and P11.

## Decision

The owner approved **Home and consolidated experience**, rank 4 (score 80) in the D-148 portfolio audit,
as the next product-definition deep dive after Arya, the personal financial baseline and account entry all
received PASS dispositions.

The approved plan is:

1. **BQ-118:** reconcile the existing Home implementation and decisions into one complete feature package,
   build a controlled-data clickable prototype, and test every defined state and interaction thoroughly.
2. **BQ-119:** owner walkthrough and PASS / REVISE / PARK / ESCALATE disposition after the agent's complete
   test evidence is available.

## Why

Home is the point where the app's many implemented capabilities must become one understandable experience.
The portfolio audit found that backend aggregation is tested, but hierarchy, partial-data meaning, recovery,
navigation and first-use comprehension remain assumptions. This work does not add a capability; it validates
and improves the already-approved MVP Home experience.

## Boundaries

- Definition and fixture prototype only. No `app/`, `backend/`, schema, API, dependency or money-logic change.
- D-104's eight Home areas remain in scope. Their hierarchy may be clarified, but none is silently removed.
- D-111's Portfolio Health naming and user-controlled drill-down remain fixed.
- P10 applies to every real financial figure: no positive/negative colour or recommendation framing.
- Account deletion, export, privacy, personalization and optional financial-context controls remain reachable.
- Prototype values are controlled fixtures and are clearly identified as such.
- Production changes require separately bounded build items after BQ-119 PASS.

## Reversibility

High. This creates documentation and a fixture-only prototype. It does not migrate data or change production
behaviour.

## Disposition

READY -> BQ-118. BQ-119 follows after the tested prototype is complete.
