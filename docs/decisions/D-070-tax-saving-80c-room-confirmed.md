# D-070 — BRIEF-016 confirmed: tax-saving narrowed to "unused 80C room," built as proposed

- **Tier:** 3, owner-confirmed — hard triggers 1 (money/calculations users rely on) and 2 (legal/tax
  shape) both fired per BRIEF-016's own framing. This entry records the owner's sign-off on that brief's
  proposed resolution, after a real design conversation about whether the narrowed scope was worth
  shipping at all (see context below), rather than reopening the analysis.
- **Context, not just a rubber stamp:** before confirming, the owner asked two real questions this entry
  preserves: (1) whether "defer" meant pre-MVP backlog or post-MVP drop — resolved by checking
  `docs/BRIEF-012_mvp_fit_prioritization.md`, which lists "tax-saving instrument multi-path modeling" as
  **must-have, required for all three founding profiles** (traces to D-054's commitment) — meaning
  dropping this from MVP was never actually on the table as a casual default, only as its own deliberate
  scope-reduction decision, which this is not. (2) What the concrete downsides of the room-only version
  are — answered directly: it satisfies the *letter* of the committed must-have but not literal "multi-path
  modeling" (a single figure, not two paths compared); the ELSS blind spot plausibly affects this feature's
  own target segment more than average; the regime question can be answered wrong; "room available"
  carries a soft implicit nudge despite never naming a product; it ends without the natural next step the
  other two comparisons offer; the ₹1.5L cap itself is a single figure that could still go stale. All
  disclosed, none blocking — same posture as D-068/D-069's own disclosed limitations.
- **Decision:** BRIEF-016 (`docs/BRIEF-016_tax_saving_80c_room.md`) adopted as proposed, in full:
  1. **No rupee tax-savings figure** — stops at **unused 80C room**, avoiding the need for a maintained
     income tax slab table entirely.
  2. **Tax regime asked as a one-off in-tool question, never stored** — same shape as `loan_vs_invest`'s
     prepay-amount input. New regime → an honest "not relevant for you" answer, stop there, no number
     shown. Old regime → proceed to the room calculation.
  3. **Formula:** `known_80c_contributions` = sum of `ppf_epf` holdings' `annual_contribution` + sum of
     `term_insurance`/`endowment_ulip` holdings' `premium` (annualized). `unused_80c_room = max(0, 150000 −
     known_80c_contributions)`.
  4. **ELSS-vs-regular-fund ambiguity disclosed in UI copy, not solved** — no `is_80c_eligible` flag
     (deliberately, per D-009's product-naming ban), so equity mutual funds are never counted toward known
     contributions, which can overstate the room figure.
  5. **Product-generic language required** (D-009) — "an 80C-eligible investment," never PPF/ELSS/NPS by
     name.
  6. **Placement:** a "Check my 80C room" entry point on the Budgeting screen (not tied to a single
     holding, unlike the other two comparisons) — a build-time placement detail, not escalated further.
  7. **Rule extraction reconfirmed a third time:** D-068's test ("does this figure require data we don't
     have or can't maintain? If so, find the closest computable figure and stop there") held for a third,
     structurally different case (tax law, not just arithmetic) — now adopted as the standing test for any
     future comparison-view work, not re-derived per case.
- **What was explicitly NOT chosen, and why:** deferring the whole sub-case past MVP (ruled out — it's
  committed scope, not a casual default) and the self-reported-tax-bracket alternative (ruled out for the
  *first* version — relies on a user-supplied number that can't be sanity-checked, for a segment plausibly
  less likely to know their own bracket precisely; not permanently rejected, tracked in
  `docs/KNOWN_LIMITATIONS.md` as a possible later enhancement if real usage shows room-only isn't enough).
- **Reversibility:** High — no live data exists yet; formula and UI are ordinary application logic.
- **Feeds:** unblocks `backend/app/services/tax_saving_room.py` and its matching UI (queued in
  `docs/BUILD_QUEUE.md`). Closes BQ-026's third and final sub-case — loan-vs-invest (D-068) and ESOP-timing
  (D-069) were already done.
- **Date:** 04-Aug-2026
