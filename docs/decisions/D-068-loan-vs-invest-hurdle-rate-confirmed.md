# D-068 — BRIEF-014 confirmed: loan-vs-invest hurdle-rate comparison built as proposed

- **Tier:** 3, owner-confirmed — hard trigger 1 (money movement/calculations users rely on) fired per
  BRIEF-014's own framing; this entry records the owner's sign-off on that brief's proposed resolution
  rather than reopening the analysis.
- **Decision:** BRIEF-014 (`docs/BRIEF-014_loan_vs_invest_hurdle_rate.md`) adopted as proposed, in full:
  1. The comparison shows a **hurdle-rate figure only** — the loan's own `interest_rate`, framed as what an
     investment would need to clear to beat prepaying — never a projected investment outcome, per §3 rule
     4 (never predict markets).
  2. **Fork 1 (prepayment mode):** both tenure-reduction and EMI-reduction figures are always returned,
     never a silently-picked default.
  3. **Fork 2 (prepayment/foreclosure charges):** assumed zero, disclosed via an explicit UI-facing note
     (`prepayment_charge_note`) rather than adding a new `characteristics` field on spec.
  4. **Rule extraction confirmed as standing:** for any future comparison FinTutor computes, the operative
     test is *does this figure require assuming what the market will do, or only what's already true today?*
     — if the former, only a hurdle/breakeven framing is available, never a projected outcome. This applies
     directly to the still-open tax-saving and ESOP-timing halves of BQ-026.
- **Built:** `backend/app/services/loan_vs_invest.py` (`compute_loan_vs_invest`) and `GET
  /loan-vs-invest` in `main.py`. Scoped to Home Loan/Personal Loan only (D-013's own framing of these two
  as the prepay-vs-invest case; Credit Card Debt is revolving, not fixed-EMI amortizing, and doesn't fit
  this math). Remaining tenure is derived from `outstanding_balance`/`emi_amount`/`interest_rate` via the
  amortization identity, not from `tenure_months`/`start_date` — self-consistent with today's stored
  balance regardless of any prior payment irregularities the schema doesn't track.
- **Verified:** `python -m py_compile` clean; route registers in a fresh venv; `/loan-vs-invest` correctly
  500s without a configured database (same limitation every DB-backed route in this remote session hits).
  The formula itself unit-tested against the system prompt's own worked example (§2: ₹40L outstanding, 9%,
  EMI ₹38,000, ₹2L prepayment) — tenure-reduction interest saved (~₹6.74L) comfortably clears the prompt's
  own qualitative claim ("well over ₹2 lakh"), EMI-reduction shows a smaller but positive saving as
  expected. Four edge cases unit-tested: non-loan product type, prepay ≥ balance, holding not found, and an
  EMI too small to cover its own interest (guarded before it could hit a math-domain error) — all rejected
  cleanly with clear error messages, not crashes.
- **Reversibility:** High — no live data exists yet; the formula and both forks are ordinary backend logic,
  changeable without migration.
- **Feeds:** the remaining un-narrowed halves of BQ-026 (comparison-view modal UI, tax-saving modeling,
  ESOP-timing) — this decision resolves the loan-vs-invest computation only.
- **Date:** 04-Aug-2026
