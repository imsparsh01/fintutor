# D-150 — Goal progress uses shared proportional live holding value

**Tier:** 3, owner-decided money logic

**Completes:** D-149's live available-value direction

**Date:** 23-Aug-2026

## Decision

For each recognized linked holding, goal progress uses at most that holding's live recorded value once across
all goals. Let `V` be the recognized non-negative holding value and `E_i` each goal link's positive earmark.

- If `sum(E) <= V`, each goal receives its full earmark.
- If `sum(E) > V`, each goal receives `V * E_i / sum(E)`.
- The holding's applied contributions across goals must total exactly the capped value at currency precision;
  any rounding remainder is assigned deterministically by largest fractional remainder, then stable goal ID.
- A missing, malformed, non-finite or unsupported valuation makes that holding contribution unknown for every
  linked goal. It contributes neither zero nor a fabricated amount.

Recognized values reuse the existing owned valuation-field contract for investment assets. Loans, term cover,
unclassified holdings and ESOP grants without an approved valuation remain excluded. Endowment/ULIP may use
only its recorded current fund value, never sum assured or maturity estimate. Links remain planning labels and
do not move, lock or reserve money.

Each goal exposes applied value plus source holding, recorded value, earmark, proportional adjustment and any
unknown/exclusion reason. Overall goal progress is the exact sum of applied known contributions; if any linked
contribution is unknown, the UI also reports that the measured total is partial.

## Why

Independent caps can count the same owned value more than once. Exclusive write-time allocation would reject
useful planning links and still need a rule when market values later fall. Shared proportional allocation keeps
links flexible while ensuring the displayed total across goals never exceeds the recognized live value.

## Build boundary

The calculation must use decimal arithmetic, preserve the two-decimal total, remain live rather than persisted,
and be covered for under-allocation, exact allocation, over-allocation, rounding ties, value decline, unknown/
invalid valuation, cross-account ownership, deleted links and multiple holdings. No suitability or progress
verdict follows from the amount.

## Reversibility

Low after users rely on displayed progress. Formula or eligibility changes require a new Tier-3 decision and
explicit stale-result treatment.
