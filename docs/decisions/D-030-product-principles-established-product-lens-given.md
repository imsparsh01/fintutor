# D-030 — Product principles established; Product lens given substantive content; product decisions become routable
- **Tier:** 3 — a meta-decision that encodes the owner's product judgment so that future product decisions
  can be routed without the owner. The most owner-only kind of decision there is: it defines what may later
  bypass the owner. Content is the owner's; the system's role was extraction and structuring.
- **Decision:** A new file, **PRODUCT_PRINCIPLES.md** (v1.0), holds FinTutor's substantive product point of
  view as a set of usable tests. Founding four, all extracted from decisions already made (not invented):
  **P1** don't ask — infer/surface/defer (D-012); **P2** teach never advise, the line is what the output
  *does* not what it *says* (D-009/D-025/D-028); **P4** start strict, relax deliberately (D-009/D-025);
  **P6** the user sees their real world, only the model sees the masked one (D-010/D-011). The Product lens
  (DECISION_PROTOCOL §3.1) now reads against this file instead of an informal feel.
- **The routing rule (DECISION_PROTOCOL §3.7):** a product decision cleanly resolved by an existing
  principle is Tier 1 — applied and logged, not escalated. Owner is asked only when (1) two principles
  conflict, (2) none covers the decision, or (3) the decision would set or amend a principle. This is what
  the owner asked for — "only critical decisions reach me."
- **Guardrail (owner-set, mirrors D-018's silent-Tier-1 dependency):** the routing rule does NOT suspend the
  §2.1 checklist. It applies at the same point every Tier-1 determination does — after the checklist runs and
  finds nothing. A principle-covered decision that trips any trigger is not Tier 1. Specifically, P2 is a
  compliance object: any decision touching where the advisory line sits fires trigger 2 → Tier 3, regardless
  of P2 appearing to resolve it. Every principle-application is logged and carries the Tier-2 retroactive
  veto, so nothing decided this way is invisible or irreversible-on-review.
- **Two placements settled during extraction (owner calls):**
  1. The "routed around twice → third fix is architectural" candidate is NOT a product principle — it governs
     how the project fixes things, not how the app behaves. Placed in DECISION_PROTOCOL §6 as precedent
     **P-002** (pattern from D-010, D-028).
  2. "Depth is rationed, visibility is not" is teaching-scoped, not app-wide. Placed in
     TEACHING_SYSTEM_PROMPT §2 as a named teaching principle (it already existed as rule 2 behaviour; now
     labelled), not in PRODUCT_PRINCIPLES.md.
- **Why the founding set is small and code-adjacent:** every principle was extracted from real
  teaching-engine and compliance decisions. The UX/UI surface is deliberately left unprincipled — no real UX
  decision has forced a principle yet, and inventing them in the abstract would violate the extraction
  discipline. Principles accrete as decisions reveal them, mirroring §6's empty-fills-by-accretion design.
- **Rule extracted:** a lens with no substantive content routes every decision in its category to the owner;
  giving a lens a set of tests is what converts that category from judgment to application. This is the
  D-013 mechanism applied to the Product lens itself.
- **Reversibility:** High — process/doc level, no code or data depends on it. The routing rule is the part
  most likely to need calibration; if principle-applications start producing owner disagreements on review,
  §3.7's "clean resolution" bar is the dial to tighten.
- **Feeds:** PRODUCT_PRINCIPLES.md (new), DECISION_PROTOCOL.md §3.1 + §3.7 + P-002 (v1.2),
  TEACHING_SYSTEM_PROMPT.md §2 (P5 label).
- **Date:** 25-Jul-2026
