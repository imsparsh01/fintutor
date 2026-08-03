# D-049 — BRIEF-006 resolved: deepen-selection logic deferred (Path C), BQ-004 re-scoped to a real interface existing

- **Tier:** 3 — owner decision on the brief (BRIEF-006) raised this session. Trigger 2 (SEBI advisory
  line — the same open question BRIEF-002/D-028 never resolved) and trigger 5 (new backend
  capability; no NLU/conversation layer exists anywhere in the codebase) both fired, routing
  straight to Tier 3 with no lens deliberation, per DECISION_PROTOCOL.md §2.0.
- **Resolves:** the question D-028 deliberately deferred ("the backend needs a rule for what to
  deepen... that decision is deliberately deferred and must be escalated on its own"). Does **not**
  interpret or supersede D-028 — D-028's own stub (the `deepen` field hand-written into fixtures for
  Phase 1 testing) stands unchanged.
- **Decision (Path C):** Backend selection logic is **not built now**. `BQ-004` is re-scoped in
  `docs/BUILD_QUEUE.md` from "blocked on a decision entry specifying the rule" to "blocked on a real
  conversation/question-intake interface existing in `app/`" — the blocker is now infrastructure
  that doesn't exist, not merely an undecided rule.
- **Why:**
  1. **Nothing currently consumes a real selection rule.** Phase 1 testing already simulates
     `deepen` via hand-written fixtures (D-028's stub) — deferring blocks no test and no feature.
  2. **Path A (a narrow classifier model call, e.g. reusing D-002's Haiku split) does not actually
     satisfy D-028's own justification for Path C.** D-028 moved the choice out of the model
     specifically because prior prompt-level fixes had been routed around twice; a Haiku classifier
     judging ambiguous free text is still a model's per-response judgment, just narrower and
     cheaper — its behavior on hard cases (question names two holdings, names none clearly) isn't
     code you can point to as "the rule." It relocates the compliance question rather than closing
     it.
  3. **Path B's immediately-buildable variant (text/alias matching) converges on Path C's behavior
     anyway.** Real natural-language questions rarely name a holding alias unambiguously, so most
     questions would fall through to "deepen nothing" (D-028's existing fallback) regardless — added
     code, little payoff. Its stronger variant (a UI selection signal) can't be built at all until
     `app/` has real screen/interaction design.
  4. **Building this now means designing against a guessed input shape.** `app/` is empty; there is
     no real question-intake flow to verify a selection rule against. Same reasoning D-038 used to
     keep the stored-Budget-snapshot option out of MVP: capability not yet needed, paid for early.
- **What this does NOT decide:** this is a timing/sequencing call, not a ruling that Path A or B are
  wrong forever. BRIEF-006's regulatory question — whether relocating judgment to a narrower model
  satisfies an "auditable in code" guarantee — stays open and unresolved. It must be answered
  whenever this is picked back up, most likely once `app/` has a real conversation interface.
  BRIEF-006's rule-extraction candidate stands as the test to apply then.
- **Reversibility:** High — nothing was built, so there is nothing to unwind. Revisiting this later
  costs nothing already spent.
- **Date:** 03-Aug-2026
