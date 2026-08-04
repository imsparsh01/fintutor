# D-073 — BRIEF-017 confirmed: variable-income budgeting via declared floor + typical range (Path B2)

- **Tier:** 3, owner-confirmed. Hard trigger 1 fired (money-calculation logic users rely on) per
  BRIEF-011/BRIEF-017's own framing; this entry records the owner's sign-off on BRIEF-017's proposed
  resolution after a real back-and-forth (owner asked for a lean, not just paths modeled) rather than a
  rubber stamp.
- **Decision:** BRIEF-017's Path B2 adopted, over Path A (rolling-window average, real new scope + a
  cold-start gap) and Path C (defer entirely, in tension with D-054's "don't treat this sub-profile as an
  edge case" commitment):
  1. **`Income.sources` items gain an optional `amount_high` field**, alongside the existing `amount`.
     Since `sources` is already a schema-less JSONB column, this needs **no database migration** — the
     cheapest possible version of B2.
  2. **`amount` keeps its existing meaning and existing role in `compute_budget()`'s math, unchanged** —
     it is now explicitly the floor/conservative figure the budget's recurring-outflow and net calculations
     are checked against. No formula change in `budget.py`.
  3. **`amount_high`, when present, is purely informational** — a "typical" companion figure shown
     alongside the floor in the UI, never fed into the budget math itself. This is what keeps the reframing
     honest: "here's what your fixed costs are checked against" (a floor, computed) vs. "here's roughly
     what you usually make" (a typical estimate, stated but not computed with) — two different claims,
     never conflated into one number.
  4. **Both figures shown in the UI**, not the floor alone — showing only the conservative number risks
     reading as "why does the app think I make less than I do," which is confusing rather than honest.
     Labeled plainly (which figure the budget uses vs. which is typical), matching D-029's provenance
     discipline: an estimate is never allowed to masquerade as a verified fact, but it isn't hidden either.
- **Why B2 over A:** the project's current standing risk is unverified surface area — nothing shipped since
  03-Aug has been run on a real device. Path A would add a new schema object, a new manual-capture flow,
  and a cold-start gap on top of that. B2 needed zero new object and zero migration, so it doesn't compound
  the same risk. This mirrors D-067's precedent directly: ship the cheap, deterministic version first, defer
  the fancier one until real usage justifies it.
- **Why B2 over C:** the marginal cost of B2 turned out low enough (no migration, no new object) that
  deferring it entirely wasn't worth the tension with D-054's explicit commitment not to treat the
  startup/gig sub-profile as an edge case.
- **Rule reconfirmed from BRIEF-017:** for a figure the user can only estimate, not verify, that feeds an
  affordability/feasibility check — default the calculation to the conservative bound, never an average.
  An average answers "what's typical"; a floor answers "am I safe." B2 is a direct application of this test,
  not a new one.
- **Path A's unpark condition (not rejected, deferred):** real gig/freelance users on the app whose income
  swings enough that a single declared floor+typical pair stops being useful — evidence, not elapsed time,
  same standing discipline as every other deferred-fidelity call in this project (D-067, D-068's
  prepayment-charge note, D-069's units-already-exercised gap).
- **Reversibility:** High — additive JSON field, no migration, no change to existing budget math. Removing
  or extending it later touches no committed data shape.
- **Feeds:** `backend/app/main.py`'s `IncomeSource` Pydantic model gains `amount_high: float | None`;
  `app/lib/income.ts`'s `IncomeSource` interface matches; `BudgetingScreen.tsx`'s income form and list
  gain the optional second field and its display.
- **Date:** 04-Aug-2026
