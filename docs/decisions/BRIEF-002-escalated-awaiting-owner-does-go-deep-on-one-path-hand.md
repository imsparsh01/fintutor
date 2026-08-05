# BRIEF-002 — ESCALATED, awaiting owner: does "go deep on one path" hand the model a ranking channel rule 5 cannot reach?
- **Status:** Tier 3 brief written and awaiting owner decision. Full brief in **BRIEF-002_deepen_channel.md**.
  Blocks further teaching-prompt work — it is the only Run 2 finding that touches the compliance line.
- **Trigger fired:** trigger 2 (legal/regulatory — the advisory line) and trigger 3 (reinterprets a standing
  principle — D-025, and bears on D-015 rule 2). Routed to Tier 3 by §4.3: D-025 is compliance-category, so
  interpreting it is Tier 3 only, no exception for interpretations that tighten. Category: Compliance,
  multi-category with product-judgment; stricter governs per §4.1.
- **The question:** D-025 stopped the model *saying* one problem deserves attention first. §2 rule 2 requires
  it to name every path and then deepen one, and says nothing about how to choose. Run 2 showed the model
  complying sentence-by-sentence while expressing the same judgment through which path it chose to explain.
  Is choosing what to deepen an act of prioritisation, and if so how is that choice made without ranking?
- **Paths modeled (not resolved):** **A** — the user's question determines what gets deepened; a holding the
  question did not touch may be named with its numbers but never becomes the explained one; costs leaving the
  sharpest number unexplained. **B** — deepen nothing on multi-path questions, equal shallow treatment for
  each, depth only on request; closes reference-frame capture too, but contradicts D-015 rule 2 as written and
  risks the drift-to-uselessness edge D-015 itself named. **C** — the backend picks the deepened path and
  tells the model via a profile field; closes the channel completely and makes the choice auditable in code
  (the D-010 move — policy becomes architecture), but is the only non-prompt-level path, requires backend
  logic that does not exist, fires trigger 5, and relocates the same hard question one layer down.
- **What only the owner can judge:** whether structural prioritisation is the same regulatory object as
  stated prioritisation; whether D-015 rule 2 (a settled product-judgment call about what a teaching moment
  is) may be amended; risk appetite on a third prompt-level fix after two have been routed around; and
  whether Run 2's Q1 output was actually harmful — if it reads as good education with acceptable exposure,
  that points to a narrower fix banning only the stated justification while permitting the selection.
- **Rule extraction (candidates, per §5.2):** (1) *"Does the rule govern what the model SAYS, or what the
  model DOES?"* — a wording-level rule can be satisfied while the judgment moves into structure; when a
  behavior re-routes after a wording fix, the next fix must govern the act. (2) *"When a prompt-level rule
  has been routed around twice, the third attempt should be architectural"* — D-010 already established this
  pattern for product names.
- **Date raised:** 23-Jul-2026
