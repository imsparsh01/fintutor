# BRIEF-016 — Tax-saving modeling narrowed to "unused 80C room," ready to confirm

> Narrowed out of BQ-026's remaining tax-saving sub-case (see `docs/BUILD_QUEUE.md`'s working notes and
> D-068/D-069's rule extraction). Written so a single yes/no unblocks the backend build — every open
> question below has a proposed answer, not just a list of forks.

---

### BRIEF — Should FinTutor compute and show an "unused Section 80C room" figure, and on what exact terms?

- **Trigger fired:** §2.1 hard trigger 1 (money/calculations users rely on) **and** trigger 2 (legal/tax
  shape) — the second is new relative to BRIEF-014/015; tax law, not just arithmetic, is the subject
  matter here.
- **Category:** Compliance governs (§4.1's stricter-category rule) — §3 rule 4 (never predict/assume) and
  D-009 (never name a specific product) both bound what's sayable here.
- **The question:** Given that FinTutor can't reliably know a user's tax regime or maintain a full income
  tax slab table, what is the largest tax-saving-related figure that's still honestly computable, and how
  should the two open gaps (regime, slab rates) be resolved without either one blocking the feature
  entirely?

### What's already settled, not re-litigated here
The full version — "investing here saves you ₹Y in tax" — isn't available. It needs (1) knowing whether
the user's 80C deductions even apply (regime-dependent: the new regime, now default, disallows most of
them) and (2) a maintained income tax slab table to convert deduction into rupees saved, which changes most
budget years. Both are real, standing gaps — not solved here, **routed around** the same way D-068 routed
around predicting market returns and D-069 routed around a final ESOP tax bill: stop one step short of the
figure that needs the missing data.

### The two gaps and their resolutions

**Gap A — tax regime.** *Proposed:* ask it as a one-off, in-tool question, not a stored profile field —
the same shape as `loan_vs_invest`'s prepay-amount input, not new onboarding/profile work. If the user
selects **new regime**: give a direct, honest, useful answer on the spot — "under the new regime, most
Section 80C deductions don't apply, so this isn't relevant for you" — and stop. No number shown, no
schema change, no new data collection. If **old regime**: proceed to the room calculation below.

**Gap B — slab rates.** *Proposed:* don't compute a rupee tax-savings figure at all. Stop at **unused 80C
room** — an amount of remaining deduction space, not a tax figure. No slab table needed, no maintenance
burden beyond the single ₹1,50,000 statutory cap itself (which can change in a future budget, but is one
number, not a table — a materially smaller ongoing-accuracy risk than the full slab structure would be).

### The formula
Given the user's Holdings:
- `known_80c_contributions` = sum of `annual_contribution` across all `ppf_epf` holdings, plus sum of
  `premium` (frequency-normalized to annual) across all `term_insurance`/`endowment_ulip` holdings — both
  are legitimately 80C-eligible and both are already stored fields.
- `unused_80c_room = max(0, 150000 − known_80c_contributions)`.

### A limitation disclosed, not solved
Equity mutual funds are **not** counted, even though an ELSS fund is 80C-eligible — the schema has no way
to distinguish an ELSS holding from a regular equity fund (deliberately, per D-009's product-naming ban;
there's no `is_80c_eligible` flag). `unused_80c_room` can therefore **overstate** the true figure for
anyone holding ELSS we can't identify. *Proposed:* disclose this in the UI copy ("this doesn't count any
tax-saving equity funds you may already hold, since we can't tell those apart from regular ones") rather
than add a new field on spec — same posture BRIEF-014/015 took for their own disclosed limitations.

### Product-generic language requirement (not new, restated because this is the case it matters most)
Per D-009, the UI copy must say "an 80C-eligible investment," never name PPF, ELSS, or NPS specifically —
same line the chat engine already holds.

### Where this lives (build-time detail, not escalated)
Unlike loan-vs-invest and ESOP-timing, this isn't tied to one holding — it's tied to income and existing
80C-eligible holdings generally. *Proposed:* a "Check my 80C room" entry point on the Budgeting screen
(where income/discretionary data already lives), matching the same modal shape (regime question, then
result) already shipped for the other two comparisons. Low-stakes, reversible placement choice, same
category as BQ-024's Chat-tab placement.

### What only the owner can judge
Whether "unused 80C room" (with the ELSS-blind-spot disclosed) is a useful enough figure to ship on its
own, without ever stating actual tax savings — or whether that's too thin to be worth building, and this
sub-case should stay deferred instead. This is squarely CLAUDE.md hard-stop territory (triggers 1 and 2
both); no amount of analysis substitutes for sign-off.

### Rule extraction
**Confirms a pattern now proven three times, not just twice:** for any comparison FinTutor computes, the
test is *does this figure require data we don't have or can't maintain (a prediction, a private valuation,
a regime, a slab table)? If so, find the closest figure that's still computable from what's already known
and stop there* — never fabricate or assume the missing piece. Worth formally adopting as the standing
test for any future comparison-view work, not re-derived case by case.

### Recommendation
Ship it as scoped above. The regime question and the room formula have no real discretion left once the
"stop before the slab table" shape is accepted; the ELSS disclosure is the same low-stakes, disclosed-
limitation move already used twice. If you agree, the backend service
(`backend/app/services/tax_saving_room.py`, matching the existing pattern) is ready to build immediately.
