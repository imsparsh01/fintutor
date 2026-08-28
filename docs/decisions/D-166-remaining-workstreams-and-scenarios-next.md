# D-166 — Complete the four remaining workstreams; Scenarios is next

- **Tier:** 3, owner-decided sequencing under D-148.
- **Date:** 29-Aug-2026
- **Traces / builds on:** D-105, D-106, D-124, D-125, D-148 and the six validated workstreams.

## Decision

The owner approved completing the four remaining D-148 product-definition workstreams and their later,
separately bounded production reconciliation in this order:

1. Scenario and focused-explorer suite.
2. Calculator suite.
3. Interactive teaching walkthroughs.
4. Reminders, engagement and learning progression.

The owner approved **Scenario and focused-explorer suite**, audit rank 7 (score 78), as the next workstream.
The bounded definition/prototype plan is:

1. **BQ-130:** reconcile existing scenario/explorer behavior into a current PRD, journey and complete state
   matrix.
2. **BQ-131:** consolidate functional, money/provenance, content, privacy, accessibility and recovery
   contracts without changing a production calculation.
3. **BQ-132:** map every requirement to acceptance evidence and route genuine unresolved forks through the
   decision protocol.
4. **BQ-133:** design/build a controlled-data clickable prototype and complete exhaustive agent QA.
5. **BQ-134:** owner walkthrough and PASS / REVISE / PARK / ESCALATE disposition.

## Why

Scenarios are the highest-ranked remaining workstream and carry the greatest remaining money/compliance risk.
They need a consistent comparison, provenance, stale-prefill and non-recommendation contract before the
Calculator and Teaching suites reuse adjacent tool patterns. Reminders/progression comes last because it
consumes completion signals from the other workstreams.

## Boundaries

- D-148's prototype-first gate and one-bounded-task discipline remain unchanged.
- The programme validates existing approved MVP capabilities. It does not unpark tax/HRA, rent-versus-buy,
  hosting, legal review, post-MVP holding families, conversation memory or another deferred item.
- BQ-130..BQ-134 are definition and controlled-fixture work only. No production app/backend, schema, API,
  dependency, persistence or money calculation may change under these items.
- Formula meaning, money logic, financial-data/privacy handling, the teach-never-advise line and any scope
  increase remain owner-only decisions.
- “Subsequent production reconciliation” is a programme commitment, not blanket authority for unspecified
  mutations. Each build is queued only after its workstream PASS and remains separately bounded.
- The final four-workstream programme closes only after all four owner PASS records, all approved production
  reconciliation, and one integrated owner walkthrough. D-124 external testing follows its own gates.

## Reversibility

High at this stage. The decision sequences documentation and controlled prototypes without touching
production behavior or user data.

## Disposition

READY → BQ-130. BQ-131..BQ-134 follow in order. Later workstreams and production builds receive their own
bounded queue entries when their prerequisite gate passes.
