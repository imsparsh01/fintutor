# BRIEF-015 — ESOP "cost of exercising today," ready to confirm

> Narrowed out of BQ-026's remaining ESOP-timing sub-case (see `docs/BUILD_QUEUE.md`'s working notes and
> D-068's rule extraction). Written so a single yes/no unblocks the backend build — every open question
> below has a proposed answer, not just a list of forks.

---

### BRIEF — Should FinTutor compute and show an ESOP "cost of exercising today" figure, and on what exact terms?

- **Trigger fired:** §2.1 hard trigger 1 (money movement / calculations users rely on) — same category
  D-065/D-066/D-068 were escalated under, regardless of how settled the analysis feels.
- **Category:** Compliance + Product, multi-category — Compliance governs (§4.1's stricter-category rule),
  since §3 rule 4 (never predict markets) is what bounds this the same way it bounded loan-vs-invest.
- **The question:** Given the constraint that FinTutor can never predict a market/valuation outcome, what
  exact figures about an ESOP grant can be shown today, and how should vesting (never designed — D-066
  deliberately deferred it) be computed?

### What's already settled, not re-litigated here
D-068's rule extraction applies directly: *does this figure require assuming what happens next, or only
what's already true today?* "Should you exercise" requires assuming future company valuation — off the
table, same as loan-vs-invest's "projected investment outcome" was. What's left is **today's numbers only**
— exercise cost and current taxable spread, using D-066's stored fields (`grant_type`, `grant_date`,
`total_units_granted`, `vesting_cliff_months`, `vesting_period_months`, `strike_price`, `current_fmv`).

### Scope fork — resolved here, not deferred
**Options only, not RSU.** RSUs have no strike price and no exercise decision — they vest straight into
owned shares, so "cost of exercising" doesn't apply to them at all. This feature is scoped to
`grant_type == "options"`; RSU holdings simply don't show this affordance, the same way `loan_vs_invest`
doesn't apply to Credit Card Debt.

### The formulas

**Vested units (new logic — D-066 explicitly left this undesigned):**
- `elapsed_months` = whole months between `grant_date` and today.
- If `elapsed_months < vesting_cliff_months`: `vested_units = 0` (nothing vests before the cliff).
- If `elapsed_months >= vesting_period_months`: `vested_units = total_units_granted` (fully vested).
- Otherwise: `vested_units = floor(total_units_granted × elapsed_months / vesting_period_months)` — linear
  vesting gated by the cliff, the standard convention for a typical 4-year/1-year-cliff plan. No fractional
  units.

**Exercise cost (deterministic, no assumption):**
- `exercise_cost = vested_units × strike_price` — the cash needed to exercise today. Not a tax figure at
  all; purely today's stored terms.

**Taxable spread (only when `current_fmv` is populated — it's nullable):**
- `spread = vested_units × (current_fmv − strike_price)`.
- If `spread > 0`: shown as the paper gain that becomes taxable perquisite income on exercise, with a
  mechanism-only explanation ("this amount is added to your taxable salary at your income tax slab rate")
  — **never converted to a final rupee tax figure**, which is exactly where this would hit the same
  tax-regime gap blocking tax-saving modeling (BQ-026's other open sub-case). Stopping at the spread, not
  the tax bill, is what keeps this buildable now.
- If `spread <= 0`: options are currently underwater. Shown as its own honest framing ("exercising would
  currently cost more than the shares are worth at today's valuation"), never a negative number presented
  as if it were a gain.
- If `current_fmv` is `null`: the spread section is omitted entirely, with a note that no current valuation
  has been recorded for this grant.

**Exercise window:** shown as static informational text ("vested options typically must be exercised
within N months of leaving"), not a computed countdown — there's no field anywhere tracking whether/when a
user has left their company, so a live countdown isn't possible without new data this brief doesn't
propose adding.

### A limitation disclosed, not solved
D-066's schema has no `units_exercised_so_far` field. "Vested units" here means cumulative vested since
grant, which overstates what's actually available to exercise if the user has already exercised some.
*Proposed:* disclose this in the UI copy ("this assumes you haven't exercised any of this grant yet")
rather than add a new field on spec — same posture BRIEF-014 took for prepayment charges (evidence-before-
schema-change, D-006/D-067's standing discipline).

### What only the owner can judge
Whether a computed, real financial figure about an ESOP grant — even one this tightly bounded to today's
known terms — is something you want shipped now, and whether the proposed resolutions above (options-only
scope, the vesting formula, stopping at spread rather than a tax figure, the exercised-units disclosure)
are the right calls. Squarely CLAUDE.md hard-stop territory; no amount of analysis substitutes for sign-off.

### Rule extraction
None new — this is D-068's existing rule ("does this figure require assuming the future, or only what's
true today?") applied to a second case. Confirming it holds here strengthens it as the standing test for
whatever comes after ESOP-timing (tax-saving modeling will need the same test applied once its own data
gaps are resolved).

### Recommendation
Ship it as scoped above. The vesting formula and exercise-cost figure have no real discretion left once
the cliff-gated-linear convention is accepted (it's the standard shape most cap tables use); the spread
framing (mechanism-only, never a tax rupee figure) is the same discipline D-068 already established, not a
new risk. If you agree, the backend service
(`backend/app/services/esop_exercise_cost.py`, matching `loan_vs_invest.py`'s pattern) is ready to build
immediately, with the frontend affordance following the same "Compare"-button-on-detail-screen shape
already shipped for loans.
