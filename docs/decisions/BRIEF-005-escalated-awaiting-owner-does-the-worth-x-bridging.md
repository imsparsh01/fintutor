# BRIEF-005 — ESCALATED, awaiting owner: does the "worth [X]" bridging pattern need its own rule, and can another named-example patch actually close it?
- **Status:** Tier 3 brief written and awaiting owner decision. Full brief in
  **BRIEF-005_worth_framing_recurrence.md**.
- **Trigger fired:** trigger 2 (§3 rule 5, the advisory line) and trigger 3 (reinterprets D-025, which named
  the exact phrase involved as a failing example). Routed to Tier 3 by §4.3 — no exception for tightening.
- **The question:** BQ-007's outputs (see PHASE1_RUN5_RESULTS.md, FINDING 11) show 4/5 runs wrapping a Card-1
  mention in "worth" framing, and 2/5 reproducing **"worth having in view"** — the literal phrase D-025
  already named as a FAIL example, not a paraphrase of it. Is this the same channel D-025/FINDING 6 already
  addressed (ranking, now leaking through the named ban itself), or a distinct channel — a generic bridging
  habit reaching for "worth X" whenever introducing anything the user didn't ask about, evidenced by Run 5
  using the identical phrase on the emergency-fund figure, not a holding at all?
- **Paths modeled (not resolved):** **A** — add a third named category to rule 5 (bridging into a
  rule-2-required-but-unasked fact) with zero introductory framing; same instrument as D-025's original fix,
  real risk it doesn't move the rate given the named phrase already leaked once. **B** — replace/supplement
  with a structural rule banning any introductory lead-in on unasked material, regardless of wording;
  targets the act rather than specific phrases (BRIEF-002's SAYS-vs-DOES lesson), harder to route around but
  harder to verify and may over-catch legitimate transitions. **C** — deterministic backend-side
  post-generation scan for known-leaked phrases; closes observed instances with a hard backstop, but is a
  scope increase (no backend exists), inherently incomplete (pattern-matching only), and doesn't resolve the
  same-channel-or-new question either way.
- **What only the owner can judge:** whether this is the same channel as D-025 (making the named-phrase
  recurrence real evidence the instrument doesn't hold) or a new one (making Path A a legitimate first
  attempt, per the same reasoning as D-035); whether the softer variants ("worth noting," "worth flagging")
  actually cross the true-vs-attend line as clearly as the original "worth having in view first" did; and
  risk appetite on trying the same instrument (named examples) a second time versus moving to a structural
  or architectural fix now.
- **Rule extraction (candidates, per §5.2):** (1) a named-example ban is falsified by the example itself
  recurring, not only by paraphrase — the example is illustration of the underlying test, not the guarantee.
  (2) when bridging language recurs on non-holding material too, that generalization is evidence of a
  distinct mechanism (a bridging habit) rather than the ranking habit the last fix targeted — scope the next
  fix to what's actually recurring.
- **Date raised:** 02-Aug-2026
