# D-055 — BRIEF-010's escalated fork resolved: ESOPs added to the product-type taxonomy as MVP scope

- **Tier:** 3 — Trigger 5 fired (MVP scope increase, hard trigger, no de-minimis exception). Owner-decided
  directly in conversation, resolving the ESOP/taxonomy fork BRIEF-010 escalated.
- **Decision:** **Path A adopted.** ESOPs are added to D-013's product-type taxonomy as a 9th MVP type,
  in MVP scope — not parked for post-MVP. Reason stated by the owner: ESOP confusion was independently
  named the startup/gig employee profile's #1 pain point (BRIEF-010); leaving it out would ship the
  founding segment's third internal profile (D-054) with structurally thinner day-one value than the
  other two.
- **Supersedes:** D-013, in respect of the type-count only ("8 MVP product types" → 9). D-013's other
  content (the 8 original types, the split-vs-merge test, the characteristic-field methodology) is
  untouched.
- **Scope of this decision — membership only, not the field schema.** This decision settles that ESOPs
  are IN the taxonomy. It does **not** design ESOP's characteristics schema (grant date, vesting
  schedule, strike price, current FMV, vested/unvested split, exercise window, tax treatment on exercise
  vs. sale, etc.) — that's real design work of the same shape D-013 itself did for the original 8 types
  (a split-vs-merge test, a lean field list), not something to invent as a side effect of a scope-membership
  decision. **Deferred as its own follow-on task**, same two-step pattern D-011 established (resolution /
  characteristics / re-humanizing) and D-013 executed (taxonomy membership resolved before characteristics
  were designed).
- **Not conflated with a pre-existing, still-separately-open item:** `PROJECT_SPEC.md` §8 already carries
  an unresolved question about whether `savings_balance` (idle cash, used in `FIXTURE_user_01.json`) needs
  a formal Nth D-013 type of its own. That question is untouched by this decision — ESOP and
  `savings_balance` are two separate open taxonomy questions, only one of which (ESOP) is resolved here.
- **Reversibility:** High as logged now (membership decision only, no schema/data yet); will drop once a
  characteristics schema is designed and any real ESOP holding data is captured, per the touched-data test
  (§2.2 of `DECISION_PROTOCOL.md`).
- **Date:** 03-Aug-2026
