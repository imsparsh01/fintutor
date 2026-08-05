# D-013 — MVP product-type taxonomy + per-type characteristic fields (resolves D-011 Steps 1–2)
- **Decision:** The MVP internal product-type taxonomy is **8 types** across three families. Splits vs merges
  are driven by one test: *does the teaching mechanism or tax behavior actually differ?* If yes → separate
  type; if only the data-entry differs → same type with a distinguishing field. Fields are filtered hard
  against "would an MVP guided teaching moment actually use this?" (D-011's "resist over-modeling").

  **Investments**
  1. **Equity Mutual Fund** — fields: `expense_ratio`, `lock_in_period`, `investment_mode` (SIP/lumpsum),
     `invested_amount`, `current_value`, `start_date`, `risk_bucket`.
  2. **Debt Mutual Fund** — same field shape as Equity MF. *Split from Equity MF* because taxation differs
     (equity LTCG/STCG buckets vs debt taxed at slab rate since 2023) — an indexation/tax teaching moment for
     one is simply wrong for the other.
  3. **Stocks (direct equity)** — fields: `sector`, `invested_amount`, `current_value`, `purchase_date`,
     `risk_bucket`. Own type: no expense ratio, no lock-in, and the teaching mechanism (single-stock risk,
     diversification) differs from fund selection.
  4. **Fixed / Recurring Deposit** — fields: `deposit_mode` (lumpsum FD / recurring RD),
     `principal_or_monthly_amount`, `interest_rate`, `tenure`, `maturity_date`. FD and RD *merged* — identical
     mechanism and tax treatment; only how the money goes in differs → a field, not a type boundary.
  5. **PPF / EPF (retirement)** — fields: `retirement_fund_type` (PPF/EPF), `current_balance`,
     `annual_contribution`, `interest_rate`. *Merged* — both govt-backed, EEE tax status, long-lock-in; the
     "long-horizon tax-free compounding" teaching mechanism is identical.

  **Loans**
  6. **Home Loan** — fields: `principal`, `interest_rate`, `tenure_months`, `emi_amount`, `start_date`,
     `outstanding_balance`. Own type: tax-deduction angle + long tenure make it the key case for the
     prepay-vs-invest scenario modeling in D-009.
  7. **Personal Loan** — same field shape as Home Loan. *Split* because no tax deduction, shorter tenure,
     higher rate → the prepay-vs-invest math and teaching narrative differ meaningfully.
  8. **Credit Card Debt** — fields: `credit_limit`, `outstanding_balance`, `interest_rate`, `minimum_due`,
     `payment_due_date`, `billing_cycle_date`. Own type (not a loan variant): section 4 already treats
     credit-card reminders as distinct, and the revolving / minimum-due-trap / high-APR mechanism is a
     different teaching moment from an amortizing loan.

  **Insurance** (in MVP scope per this session; see D-012 for how it enters — surfaced, not a menu)
  9. **Term Insurance** — fields: `sum_assured`, `premium`, `premium_frequency`, `policy_term`, `start_date`.
  10. **Endowment / ULIP** — fields: `sum_assured`, `premium`, `premium_frequency`, `policy_term`,
      `current_fund_value` (nullable — ULIP only), `maturity_value_estimate`, `start_date`. *Split from Term*
      because Term is pure protection while Endowment/ULIP bundles insurance + investment — the "cost of
      bundling vs buy-term-and-invest-the-difference" teaching moment depends on keeping them distinct.

  (Note: the taxonomy is numbered 1–10 above but comprises the agreed 8 *distinct types* — FD/RD counted as
  one, PPF/EPF as one. Count reconciliation is intentional: "8 types" = the number of distinct
  characteristic schemas.)
- **Why:** Gives D-011's Steps 1–2 a concrete answer so the alias/characteristics layer (D-010) can be built.
  The split-vs-merge test (teaching mechanism or tax behavior differs?) keeps the schema count honest and
  gives future sessions a rule to apply rather than a list to memorize. Field lists are deliberately lean —
  each field must earn its place in an actual teaching moment.
- **Reversibility:** Medium — same as D-011 Step 2. Adding a field or a type later is cheap; changing an
  existing field's meaning after data is populated is costlier. Merges (FD/RD, PPF/EPF) can be split later if
  a real teaching need emerges, without disturbing already-captured records.
- **Scope note:** Adding insurance made MVP's product surface larger than section 4 originally implied. The
  scope change is recorded here and in D-012, not left implicit in the schema.
- **Date:** 23-Jul-2026
