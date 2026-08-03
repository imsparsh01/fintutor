# D-051 — BRIEF-007 resolved: Path A adopted, staged (WHICH now, WHEN verified before shipping)

- **Tier:** 3 — owner decision on the brief (BRIEF-007) raised in scoping D-012. Triggers 2 and 3
  fired originally, routing to Tier 3 with no lens deliberation.
- **Decision (Path A, staged):**
  1. **WHICH (candidate selection) is built now**, as a backend build task (BQ-013). A fixed,
     hand-written pairing table run against the stored profile (Holdings/Income/Goal — same shape as
     `compute_budget()`) produces a candidate list of unrecorded product types worth surfacing. No
     model judgment anywhere in this half — genuinely mechanical, auditable code, unlike BRIEF-006's
     rejected classifier-model path.
  2. **WHEN (moment selection) is NOT shipped until verified.** The model may only raise a candidate
     when D-032's existing on-topic constraint is satisfied — but that constraint was built and tested
     against a different scenario (naming an already-held holding on an off-topic question, FINDING 8).
     Whether it transfers cleanly to *introducing* an unrecorded product type is unconfirmed. Must be
     re-verified via the same Phase-1 fixture methodology that closed FINDING 8/9/10/11 before this
     ships to any live path.
  3. **Ties among simultaneously-eligible candidates are broken by fixed precedence in the pairing
     table, not the model.** A hand-authored, owner-reviewed precedence order in code satisfies the
     same architectural-guarantee bar D-028 already established for `deepen` — a fixed rule a human
     can read and predict the output of, not a per-response judgment call.
- **Why:**
  - **Rejected Path C (defer entirely).** Unlike BQ-004/D-049, WHICH has no missing-interface
    blocker — it's computable today against schema that already exists. Deferring here would also
    reverse D-012's explicit, deliberate commitment ("applies to ALL product types for MVP... core
    UX, not a later-phase add-on"), a materially bigger cost than deferring an always-secondary,
    already-stubbed mechanism.
  - **Rejected Path B (leave both to the model).** This is the exact shape of behavior D-028 already
    found gets routed around once real compliance weight attaches (the Run 1/Run 2 pattern). Choosing
    it here means knowingly repeating a mistake already paid for once.
  - **Path A's WHICH half is not the same shape as BRIEF-006's rejected classifier path.** A fixed
    pairing table is code, not a smaller opaque model — the "does this relocate judgment or actually
    close the gap" critique that sank BRIEF-006's Path A does not apply here.
- **What this does NOT decide:** the actual content of the pairing table (which specific pairings are
  "natural," and the precedence order for ties) is a real product-judgment artifact, scoped separately
  as BQ-013 and confirmed with the owner before code is written — this entry settles the *mechanism*,
  not the table's contents. It also does not settle exactly how/when the WHEN verification pass runs;
  that is scheduled as a precondition on shipping, not designed here.
- **Reversibility:** High — nothing built yet; the mechanism is pure code with no data dependency.
- **Date:** 03-Aug-2026
