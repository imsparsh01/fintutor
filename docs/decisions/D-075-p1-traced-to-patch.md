### D-075 — P1's "Traced to" note patched to reflect D-031's narrowing of D-012

- **Tier:** 1 — mechanical transcription of a fact already decided (D-031 explicitly states it partially
  supersedes D-012 by permitting a manual/browse secondary path). No new interpretation is made here; this
  just brings P1's documentation in `PRODUCT_PRINCIPLES.md` in line with a supersession that already
  happened. No trigger fires: bounded, reversible, contained to this session, doesn't touch money-logic,
  doesn't touch the teach-not-advise line, doesn't grow MVP scope.
- **Decision:** P1 ("Don't ask; infer, surface, or defer") keeps its test and scope unchanged. Its "Traced
  to" note in `docs/PRODUCT_PRINCIPLES.md` gains one sentence:
  > *Narrowed by D-031: a manual/browse entry point into the same sections is permitted as the secondary
  > path — this principle governs which path is primary, not whether a fallback may exist.*
- **Why:** D-031 already settled that a manual/browse path into the persistent category sections is a
  permitted MVP-build secondary path, alongside AI-surfacing as primary. P1's provenance note didn't
  reflect that yet, which risked a future reader treating P1 as forbidding any manual entry point at all —
  it doesn't, and never did after D-031.
- **Context:** Item 1 of 3 in the live UX-principles-section discussion opened in session 2026-08-05a
  (continuing the D-031-anticipated, Decision-2/3-unblocked UX principles work). Owner confirmed the exact
  proposed wording verbatim before this was applied. Items 2 (persistent, always-accessible sections —
  flagged tension: does "persistent" apply to an empty section the same as a populated one?) and 3 (no
  comprehension gates / no lesson-tree, tracing to `PROJECT_SPEC.md` §2's "learn on the go" line) remain
  open, to be taken up next in the same live conversation.
- **Reversibility:** High — a documentation note inside a principles file, no code or data depends on it.
- **Date:** 05-Aug-2026
