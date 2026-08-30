# Calculator Suite — Owner Decision Register

**Status:** BQ-147 owner package  
**Routing:** all items are Tier 3 because they set money calculations, financial-data use or the teach-never-advise boundary.

## Recommended complete package

### O-CA-1 — Numeric domains

**Recommend A:** reuse the approved strict whole-string grammar, set money inputs to ₹0..₹1 lakh crore (formula-required positive fields exclude zero), annual rates to -100%..1,000% only where negative is explicitly valid and 0%..1,000% otherwise, modeled horizons to 1..2,400 rounded months, and every displayed money output to `Number.MAX_SAFE_INTEGER`. Formula-specific tighter caps below override the shared ceiling.

Why: consistent with shipped safe engines and Scenario precedent; prevents overflow without inventing financial meaning.

### O-CA-2 — SIP Goal

**Recommend A:** permit explicit 0% with `target / roundedMonths`; accept horizons that round to 1..2,400 months; positive target ≤₹1 lakh crore; rate 0..1,000%; month-end ordinary-annuity inverse for positive rates; round rupees only for display.

### O-CA-3 — Home Loan EMI

**Recommend A:** permit explicit 0% with `principal / roundedMonths`; positive principal ≤₹1 lakh crore; tenure rounds to 1..600 months (home-loan relevance and Scenario loan boundary); rate 0..1,000%; monthly amortisation for positive rates; show EMI and total interest from unrounded intermediates.

### O-CA-4 — Inflation Impact

**Recommend A:** allow -100%..1,000% because deflation is a real arithmetic branch; present cost >0 ≤₹1 lakh crore; annual horizon 0..200 years including fractional years; at -100%, positive horizon produces zero; reject bases below zero and unsafe outputs. Copy calls the entered rate fixed and user-owned.

### O-CA-5 — Step-up SIP

**Recommend A:** allow explicit 0% return and 0% step; starting contribution >0 ≤₹1 lakh crore; both rates 0..1,000%; horizon positive integer 1..200 years; retain D-129 month-end/12-month-block convention; reject unsafe intermediate/output.

### O-CA-6 — CAGR

**Recommend A:** require positive initial/final values ≤₹1 lakh crore and years >0..200 including fractions; allow signed result naturally (loss/equality/gain); reject unsafe ratio/root/output; display to two decimals without using display rounding in arithmetic.

### O-CA-7 — Goal contribution gap

**Recommend A:** keep it manual-only in this workstream. Support current≥target as modeled contribution zero and signed `planned - modeled` without “surplus/shortfall/on track”; retain existing safe-engine domains and D-129 timing.

Why: adding saved-goal/funding candidate semantics is not required for the approved question and creates provenance/allocation complexity.

### O-CA-8 — Recorded candidates

**Recommend A:** Emergency Coverage remains the sole candidate-capable Calculator for this package, using its existing attributed budget/FD components. Credit-card Payoff stays manual because stored credit-card fields do not include a user-owned future payment and balance/rate source semantics need a separate contract.

### O-CA-9 — Arya handoff

**Recommend A:** every valid current result may offer “Explore the mechanism with Arya” using a confirmed exact payload of calculator type, normalized inputs, formula boundary and omissions. Exclude names, aliases, institutions, record IDs/source records and evaluative result labels. Changed/invalid/capped states have no action; cancel sends nothing.

Why: all nine mechanisms are bounded and this connects arithmetic to FinTutor's teaching outcome without asking Arya to choose or judge.

## Alternatives rejected by the recommendation

- B: preserve each current permissive parser/zero behavior. Rejected for inconsistent safety and silent partial parsing.
- C: reject every zero/fraction branch. Rejected because zero is a legitimate user-owned assumption where the mechanism has an exact branch.
- B for O-CA-7/8: add more saved-record prefills. Rejected because it expands financial-data coupling without improving the core manual question.
- B for O-CA-9: no teaching handoff. Rejected because it leaves transparent arithmetic disconnected from FinTutor's mechanism teaching despite an approved privacy-safe pattern.

## Owner response requested

Approve the **complete recommended package**, or name the O-CA item(s) to revise. Approval authorizes BQ-148's controlled prototype only; production mutations remain separately queued after owner validation PASS.
