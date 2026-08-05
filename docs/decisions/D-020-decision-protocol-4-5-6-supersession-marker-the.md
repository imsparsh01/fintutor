# D-020 — Decision protocol §4/§5/§6: supersession marker, the narrowing rule, output formats, precedent log
- **Decision:** DECISION_PROTOCOL.md §4, §5 and §6 are written. The protocol is COMPLETE at v1.0 and D-017's
  hard cap is reached — next work is Phase 1 (D-006). Two owner judgment calls this session, both in §4:
  1. **Supersession requires a formal marker.** Any log entry overriding an earlier one carries a
     `**Supersedes:** D-0XX — [what changed]` field as its first line. The superseded entry is left exactly
     as written — no edit, no banner, no strikethrough, since adding one would itself be a rewrite. Partial
     supersession must state its scope explicitly ("supersedes D-0XX in respect of X only"). Reading rule:
     an entry governs unless a LATER entry names it in a Supersedes field. This is also the mechanism for
     §2.3's Tier-1 promotion — promotion and supersession are the same operation.
  2. **The narrowing rule — interpretation is tiered by category.** Interpreting a *compliance-category*
     decision (D-009, D-010, D-016 and successors) is Tier 3 ONLY, with no exception for interpretations that
     appear to tighten. Interpreting any other decision may happen at Tier 2, but must be logged as an
     interpretation (`**Interprets:** D-0XX`, distinct from Supersedes) and carries an automatic REVIEW-FLAG.
- **Why the narrowing rule is split this way:** contradiction is loud and gets caught; interpretation is
  quiet. A decision that settles what an earlier one *meant* in an unforeseen case moves the line without
  ever appearing to disagree with it — e.g. whether an asset-class label counts as a "product name" under
  D-009. For compliance that is fatal: D-009's entire logic is start-strict and relax only deliberately with
  review, and a rule narrowable at Tier 2 is not strict, it is strict until something needs it not to be.
  Tightening is included because tightening looks safe and therefore looks skippable, yet it still changes
  product behavior, may not be what the owner actually decided, and sets precedent for the next
  interpretation. The tier tracks who owns the line, not which direction it moved. Non-compliance
  interpretations get the mandatory flag because drift is cumulative — three individually defensible
  narrowings of D-015 could move the teaching method somewhere the owner never chose; the flag makes it
  visible while it is one step long.
- **§5 (output formats, mechanical):** three shapes, all landing in DECISION_LOG.md's existing
  what/why/reversibility/date format. Tier 1 = one line. Tier-2 recommendation = decision + the four-lens
  block (Compliance always present; skipped lenses LISTED with their skip reason, never omitted, per §3.5) +
  why + reversibility + optional dependency flag. Tier-3 brief = trigger fired, the question, paths modeled
  with consequences, what only the owner can judge, attached work-in-progress lens analysis if it escalated
  mid-deliberation, and a **rule-extraction** field. No recommendation field unless the owner asks — the
  system models paths and does not pick, mirroring D-009 applied inward.
- **Rule extraction is the compounding mechanism.** D-013 is the proof: one owner-set test (split-vs-merge)
  converted ten downstream decisions from judgment into application. Every Tier-3 brief must ask whether it
  produced such a test. Without that field the protocol routes the same decisions forever.
- **§6 (precedent log):** opened empty by design. Append criteria: a decision fitting none of the five
  categories; a trigger firing unexpectedly or on something clearly mechanical; a first BLOCK or an escalated
  deadlock; a lens that has only ever returned PASS; an interpretation revealing genuinely unclear scope.
  Review trigger: at roughly ten entries the §1 taxonomy is probably wrong rather than incomplete — revisit
  it deliberately as its own Tier-3 decision. Below ten, append; do not redesign.
- **Reversibility:** High — process-level, no code or data depends on it. The parts most likely to need
  calibration are the lens definitions (§3) and whether the compliance-interpretation rule proves too strict
  in practice.
- **Date:** 23-Jul-2026
