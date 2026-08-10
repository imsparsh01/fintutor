# D-103 — ESOP "what we won't say" block: offer half added (resolves BQ-052)

**Tier:** 3 — owner-decided directly in conversation. Compliance-category copy (D-091's own tier),
same trigger as D-091 itself.

**Date:** 11-Aug-2026

## Decision

The ESOP exercise-cost modal's "what we won't say" block gains an offer half, completing D-091's
three-part requirement. Wording chosen (Option A):

> "A view on whether the company's value holds. Nothing here estimates that. What this screen does
> give you: the cash cost and the spread — the two numbers that bound your decision regardless of
> the valuation call."

## What this resolves

BQ-052: D-091 requires every "what we won't say" block to state what the app will do instead.
The ESOP block previously had no such offer. A prior build agent wrote a sentence claiming the app
computes tax implications — reverted as factually false (the service deliberately withholds a rupee
tax figure because a flat 30% isn't each user's real perquisite rate).

## Why Option A over the alternatives

- **Option B (point to Chat)** — accurate but adds a dependency on Chat being the right next step
  for every user who opens this modal. The offer should be immediate.
- **Option C (narrow D-091's requirement)** — would require a second Tier-3 amendment to D-091
  itself. The simpler path is an accurate offer that fits the existing requirement.

## Accuracy check

The offer names exactly two figures the screen already shows: exercise_cost ("cash cost") and
spread ("the spread"). Both are computed by the backend and rendered unconditionally when present.
No tax figure, no valuation estimate, no company-specific claim.

## D-091 checklist

1. ✅ Names the specific verdict declined: "a view on whether the company's value holds"
2. ✅ States what the app will do instead: "the cash cost and the spread — the two numbers that
   bound your decision regardless of the valuation call"
3. ✅ Never apologises; frames the refusal as a property of what the app is
