# D-069 — BRIEF-015 confirmed: ESOP "cost of exercising today" built as proposed

- **Tier:** 3, owner-confirmed — hard trigger 1 (money movement/calculations users rely on) fired per
  BRIEF-015's own framing; this entry records the owner's sign-off on that brief's proposed resolution
  rather than reopening the analysis.
- **Decision:** BRIEF-015 (`docs/BRIEF-015_esop_exercise_cost_today.md`) adopted as proposed, in full:
  1. **Scope: options only, not RSU** — `grant_type == "options"`. RSUs have no strike price and no
     exercise decision, so this feature simply doesn't apply to them.
  2. **Vesting formula (new logic — D-066 left this undesigned):** cliff-gated linear vesting.
     `elapsed_months < vesting_cliff_months` → 0 vested. `elapsed_months >= vesting_period_months` → fully
     vested. Otherwise `floor(total_units_granted × elapsed_months / vesting_period_months)`.
  3. **Exercise cost** = `vested_units × strike_price` — deterministic, no assumption.
  4. **Taxable spread** = `vested_units × (current_fmv − strike_price)`, shown only when `current_fmv` is
     populated. Positive spread → shown as the paper gain that becomes taxable perquisite income, mechanism
     explanation only, **never converted to a final tax-rupee figure** (that needs regime data, the same
     gap blocking tax-saving modeling — this stays one step short of it, deliberately). Non-positive spread
     → shown as "options currently underwater," never a raw negative number framed as a gain. `current_fmv`
     null → spread section omitted, with a note explaining why.
  5. **Exercise window** shown as static informational text, not a computed countdown (no field tracks
     whether/when a user has left their company).
  6. **Disclosed limitation, not solved:** no `units_exercised_so_far` field exists, so "vested units" here
     means cumulative-since-grant, not net of any exercises already done — disclosed in UI copy rather than
     adding a new field on spec.
  7. **Rule extraction reconfirmed:** D-068's test ("does this figure require assuming the future, or only
     what's true today?") applied a second time and held — the standing test for whatever comparison work
     comes after this (tax-saving modeling will need it applied once its own data gaps are resolved).
- **Why now, second in sequence:** BRIEF-015 was picked over tax-saving modeling specifically because it
  doesn't hit a data-model wall the way tax-saving does (tax regime, ELSS-eligibility) — same math-boundary
  reasoning as D-068, applied to confirm which of BQ-026's remaining sub-cases was actually ready first.
- **Reversibility:** High — no live ESOP data exists yet; formula and UI are ordinary application logic,
  changeable without migration.
- **Feeds:** unblocks `backend/app/services/esop_exercise_cost.py` and its matching UI affordance on the
  ESOP holding detail screen (queued in `docs/BUILD_QUEUE.md`). Tax-saving modeling remains BQ-026's one
  fully open sub-case after this.
- **Date:** 04-Aug-2026
