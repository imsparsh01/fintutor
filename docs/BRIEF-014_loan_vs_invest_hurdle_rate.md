# BRIEF-014 — Loan-vs-invest comparison: hurdle-rate-only shape, ready to confirm

> Narrowed out of BQ-026's math half (see the D-067 session and `docs/BUILD_QUEUE.md`'s working notes).
> Written so a single yes/no unblocks the backend build — every open question below has a proposed
> answer, not just a list of forks.

---

### BRIEF — Should FinTutor compute and show a loan-vs-invest "hurdle rate," and on what exact terms?

- **Trigger fired:** §2.1 hard trigger 1 (money movement / calculations users rely on). This is new
  financial-calculation logic shown to real users — CLAUDE.md's hard-stop list, same category D-065/D-066
  were escalated under, regardless of how settled the analysis feels.
- **Category:** Compliance + Product, multi-category — Compliance governs (§4.1's stricter-category rule),
  since §3 rule 4 (never predict markets) is the constraint that shapes what's even computable here.
- **The question:** Given the constraint that FinTutor can never predict a market return (§3 rule 4), what
  is the exact, complete formula for a loan-vs-invest comparison, and how should the two remaining
  implementation forks (prepayment mode, prepayment charges) be resolved?

### What's already settled, not re-litigated here
The **shape** is forced, not chosen: assuming a specific investment return to project an ending value
would be predicting the market, just computed server-side instead of said by the model — the same
forbidden act, different location (§3 rule 4). The only shape left is a **hurdle rate**: "your investment
would need to clear the loan's own rate to beat prepaying," computed entirely from the loan's own stored
terms, no market assumption. This part isn't a fork — it's what's left once the constraint is applied.

### The formula
Given a loan's stored `principal`, `interest_rate` (r, annual %), `tenure_months` (n), `emi_amount` (E),
`outstanding_balance` (P), and a prepayment amount X:

**Prepay side (deterministic, no assumption):**
- Monthly rate `i = r / 12 / 100`.
- New principal after prepayment: `P' = P - X`.
- **Tenure-reduction** (EMI unchanged, loan ends sooner): solve for new remaining months
  `n' = -ln(1 - i·P'/E) / ln(1+i)`. Interest saved = `(E·n - P) - (E·n' - P')`.
- **EMI-reduction** (tenure unchanged, smaller payment): solve for new EMI
  `E' = P'·i·(1+i)ⁿ / ((1+i)ⁿ - 1)`. Interest saved = `(E - E')·n`.

**Invest side (the hurdle rate, not a projection):**
- Headline figure: the loan's own `interest_rate`, stated plainly — "your money would need to earn more
  than r% a year to come out ahead of prepaying."
- Refinement, per D-029's existing provenance rule (a number not from the user's own profile is a range,
  framed as typical, never a point estimate): a brief note that real investment returns are usually taxed
  while avoided loan interest isn't, so the true bar is somewhat above the raw rate — framed as a range
  note, not a second point figure. Exact wording is a system-prompt/UI-copy detail, not part of this brief.

### The two open forks — proposed resolutions

**Fork 1 — which prepayment mode to show.** Banks let a borrower choose tenure-reduction (usually the
larger total-interest-saved number) or EMI-reduction. Showing only one, silently, risks the same "picking
a winner through structure" pattern BRIEF-002/D-028 already found once (ranking via what's shown, not what
the model says).
- *Proposed:* compute and show **both**, labeled plainly ("if you keep the EMI the same" /
  "if you keep the tenure the same"). No default silently picked. Neutral, slightly more UI surface, no
  ongoing judgment call embedded in the code.

**Fork 2 — prepayment/foreclosure charges.** No field for this exists on Home Loan or Personal Loan
characteristics (D-013). Ignoring it silently overstates prepaying's benefit for any loan that does charge
one — RBI bars this on floating-rate home loans to individuals, but personal loans and some fixed-rate
products can still carry it.
- *Proposed:* assume zero and say so explicitly in the UI copy — "this doesn't account for any prepayment
  or foreclosure charges your lender may apply." Rejected: adding a `prepayment_charge_percent` field now,
  since it's an unforced schema change (D-066-shaped, but no evidence yet that users are hitting this gap
  in practice) — matches this project's own evidence-before-generalizing discipline (D-006, D-067). Can be
  added later the same low-cost way D-066 added ESOP's fields.

### What only the owner can judge
Whether a computed, real financial figure shown inside the app — even one this tightly constrained to the
loan's own contractual terms — is something you want shipped now, and whether the two proposed resolutions
above (show-both, assume-zero-with-caveat) are the right calls or you'd rather decide differently. This is
squarely CLAUDE.md's hard-stop territory; no amount of analysis substitutes for that sign-off.

### Rule extraction
**The never-predict-markets constraint reduces to a reusable test:** for any comparison FinTutor computes,
ask *does this figure require assuming what the market will do, or only what's already true today (a rate,
a balance, a stored term)?* If it requires an assumption about the future, only a hurdle/breakeven framing
is available — never a projected outcome. This is the same test that will need re-applying to tax-saving
modeling and ESOP-timing (both still open), so it's worth confirming as a standing rule now rather than
re-deriving it per case.

### Recommendation
Ship it as scoped above — both forks resolved as proposed (show both prepayment modes; assume zero
prepayment charge with an explicit caveat, no new field). The formula itself has no discretion left in it
once the hurdle-rate shape is accepted; the two forks are low-stakes, reversible UI/copy choices, not
further financial-calculation risk. If you agree, the backend service (`backend/app/services/
loan_vs_invest.py`, matching the existing `consolidated.py`/`budget.py` pattern) is ready to build
immediately — no further design work blocking it.
