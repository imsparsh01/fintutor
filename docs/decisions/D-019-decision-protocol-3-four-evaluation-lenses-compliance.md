# D-019 — Decision protocol §3: four evaluation lenses, compliance veto, relevance selection with a floor
- **Decision:** DECISION_PROTOCOL.md §3 is written and complete. The four lenses are **Compliance**,
  **Product**, **Technical**, and **Cost-and-Scope**, each defined not by a job title but by *the objection
  only it can raise*. Four owner judgment calls:
  1. **Compliance BLOCK is a hard veto.** If the Compliance lens blocks, the decision escalates to Tier 3
     regardless of what the other three lenses said — no synthesis, no outvoting. This makes Compliance
     structurally different from the other lenses, matching D-009's start-strict logic. Accepted cost: more
     escalation. Justified by asymmetry — a false escalation costs a conversation, a missed one costs the
     product.
  2. **Lenses are relevance-selected, EXCEPT Compliance, which always runs.** Running all four on every
     decision generates padding, and padding stops being read. But the veto-holding lens is the most
     dangerous one to skip: a lens never invoked raises no objection, and §2.4's doubt threshold flags
     uncertainty in analysis, not absence of analysis. Compliance is therefore exempt from selection and
     usually returns a one-line PASS.
  3. **Verdicts are structured: PASS / CONCERN / BLOCK plus exactly one sentence.** Not free-form analysis.
     Structure is what makes verdict history auditable (see §3.5).
  4. **Deadlock between two non-Compliance lenses escalates to Tier 3.** No invented precedence order
     (Product-beats-Technical or the reverse) — manufacturing a tiebreaker would fabricate a resolution the
     analysis does not support. Two valid lenses in genuine opposition IS a decision with real tradeoffs and
     no clear answer, which is close to the definition of what the owner should see.
- **Scope note on the Cost-and-Scope lens:** deliberately narrowed. It does NOT ask "does this add scope" —
  trigger 5 (§2.1) already makes any scope-adding decision Tier 3, so such a decision cannot reach Tier 2.
  What remains for the lens is what triggers do not catch: **owner attention and ongoing maintenance drag**
  (a doc that must be hand-synced, a convention that must be remembered). In a solo bootstrapped project
  attention is the scarce resource; money barely varies. This lens is the only guard on it.
- **Anti-decoration rule (§3.5):** the failure mode of a lens system is four lenses that read the same
  context and reach the same conclusion, dressed as deliberation. Two mechanisms guard it: skips are recorded
  explicitly ("Technical: not run — no build implication"), making a wrong skip legible after the fact; and
  because each run yields exactly one verdict word, verdict history can be scanned. A lens that has returned
  nothing but PASS across many decisions is miscalibrated or unreached — either way that is a finding about
  the protocol and belongs in §6 as precedent.
- **Why:** Tier 2 is only worth having if the lenses actually disagree. Defining each lens by the objection
  only it can raise is what forces genuine angles rather than four restatements of the same reasoning. The
  compliance floor closes the one gap the §2.4 doubt threshold structurally cannot catch.
- **Consequence for §4:** three of §4's four planned rules are now settled inside §3 (compliance veto,
  deadlock escalation, stricter-category-governs). §4 shrinks to two open questions: whether superseding
  entries need a formal supersession marker, and whether a Tier-2 decision may narrow the meaning of an
  earlier Tier-3 one without escalating.
- **Reversibility:** High — process/prompt-level, no code or data depends on it. Lens definitions are the
  most likely part to need calibration once real Tier-2 decisions run through them.
- **Date:** 23-Jul-2026
