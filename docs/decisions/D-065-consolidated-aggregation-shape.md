# D-065 — Consolidated net-worth aggregation shape: FD/RD value source, per-family totals not a net figure

- **Tier:** 3 — hard trigger 1 fires (`CLAUDE.md`: "anything touching money movement, calculations users
  rely on, or financial data"). BQ-018 (Consolidated net-worth aggregation endpoint) had no already-decided
  formula to execute against — unlike BQ-010's budget computation and BQ-017's goal progress, both of which
  D-038 spelled out field-by-field — so this could not be built as mechanical BUILD_QUEUE.md execution.
  Escalated per `BUILD_QUEUE.md`'s own rule 3 rather than guessed.
- **Context:** Building BQ-018 surfaced two real gaps once the actual D-013 field lists were checked
  against what "aggregate across holdings" would need: (1) FD/RD holdings store `principal_or_monthly_amount`
  (the deposit/contribution amount) but no accrued current-balance field — unlike Equity/Debt MF, Stocks
  (`current_value`), PPF/EPF (`current_balance`), and Endowment/ULIP (`current_fund_value`, nullable), which
  all have one. (2) PROJECT_SPEC.md §4 item 4 says "net worth / portfolio across sections" without
  specifying whether that's a single signed figure (assets minus loan balances) or per-family totals.
- **Decision (both owner-confirmed, same session):**
  1. **FD/RD value = `principal_or_monthly_amount`, read as-is.** No interest-accrual formula is computed.
     This slightly understates a matured/part-way FD's true balance but introduces no new financial
     calculation — it purely reads an already-stored field, same posture as every other type in this
     endpoint. Computing real accrued value (compounding from `principal`, `interest_rate`, `tenure`,
     `start_date`/implied maturity) is explicitly NOT decided here — it would be its own money-calculation
     decision if ever wanted.
  2. **The endpoint returns separate per-family totals, not one net figure.** `investments_total`,
     `loans_total`, `insurance_total` (cash-value holdings only — Endowment/ULIP's `current_fund_value`;
     Term Insurance contributes nothing, it has no fund value) are returned as distinct numbers. No
     server-side subtraction into a single signed "net worth." Rejected the single-figure alternative:
     safer against a category being added/excluded later silently changing what a net number means, and
     avoids presenting a subtraction as more precise than the FD/RD approximation in (1) actually is.
- **Why:** Both choices favor honesty about precision over a rounder-looking number. (1) avoids inventing a
  compounding formula nobody has reviewed — the FD/RD gap is a real product limitation, now recorded rather
  than silently patched over. (2) keeps the endpoint's output legible and matches D-038's reference-vs-store
  discipline in spirit: don't fabricate a derived figure (net worth) when its stated inputs already have a
  known approximation baked into them; let the app/UI decide how to present per-family totals together.
- **Rule extraction:** when a BUILD_QUEUE item needs a financial total across `characteristics` fields that
  D-013's type list doesn't uniformly provide (as `current_value`/`current_balance`/`outstanding_balance`
  do for most types, but FD/RD's `principal_or_monthly_amount` does not), that gap is itself a hard-stop
  trigger — check the field list before assuming a "sum the obvious field" build task is mechanical.
- **Reversibility:** High right now — no consolidated-aggregation code or data exists yet (touched-data
  test). Revisit if FD/RD accrual or a single net-worth figure becomes a real product ask; both are additive
  changes to this endpoint's shape, not a rewrite.
- **Feeds:** unblocks BQ-018's build (queued in `docs/BUILD_QUEUE.md`) with a concrete formula to execute
  against.
- **Date:** 04-Aug-2026
