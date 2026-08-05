# BRIEF-004 — ESCALATED, awaiting owner: does the gap-surfacing rule (D-032) need to widen, without making FINDING 9 worse?
- **Status:** Tier 3 brief written and awaiting owner decision. Full brief in
  **BRIEF-004_gap_surfacing_scope.md**. Nothing proceeds on the teaching prompt's §2/§3 rules until this is
  settled — per D-034, this is exactly the category the autonomy grant does not cover.
- **Trigger fired:** trigger 2 (legal/regulatory — the advisory line, gap-surfacing scope) and trigger 3
  (reinterprets D-032, itself compliance-category). Routed to Tier 3 by §4.3 — no exception for
  interpretations that tighten.
- **The question:** Run 4's repeat series (n=5, `FIXTURE_user_01.json`, Q1) produced two findings. **FINDING
  9:** the model drops Card-1 (42% APR, the fixture's dominant number) from the answer entirely, 2/5 runs — a
  completeness failure of §2 rule 2's "name every path" guarantee. **FINDING 10:** one run (1/5) volunteered
  the term-insurance gap unprompted, mid-answer, on a question that never touches insurance — matching a
  condition D-032 itself pre-registered as sufficient evidence its on-topic fix (Path B) is insufficient,
  regardless of rate. The brief's central question: is FINDING 10 that pre-registered falsification (the same
  channel as FINDING 8 failing twice, per P-002), or a genuinely new channel (mid-answer insertion, distinct
  from the closing-offer channel D-032's rule actually governs) — and can any fix to FINDING 10 avoid making
  FINDING 9's under-naming worse, since both live in the same prompt section (§2) and pull in opposite
  directions (one wants the model to volunteer less, the other wants it to reliably include more)?
- **Paths modeled (not resolved):** **A** — patch the specific hole: extend §2 rule 3's on-topic constraint
  to the whole answer, not just the closing offer; lowest risk to FINDING 9, but only correct if FINDING 10 is
  read as a new channel rather than a repeat. **B** — adopt D-032's own reserved broader option: a standalone
  gate on all unprompted surfacing regardless of location; closes both channels in one rule, but is the path
  most likely to bleed into FINDING 9's territory since it isn't obviously scoped to *new* gaps only. **C** —
  move gap-surfacing eligibility to the backend (a `surfaceable_gaps` field, the D-010/D-028 architectural
  move); strongest guarantee, but is itself a scope increase (no backend exists yet) requiring its own
  escalation.
- **What only the owner can judge:** whether FINDING 10 is the same failing channel as FINDING 8 or a new one
  (determines whether Path A is a legitimate first attempt or already a third pass that should go straight to
  B/C per P-002); whether D-032's rate-independent pre-commitment should still bind at n=5; whether FINDING 9
  and FINDING 10 should be decided together or sequenced separately; and whether the Path C architecture cost
  is worth paying now, ahead of the otherwise-undesigned D-012 trigger-logic work it would require.
- **Rule extraction (candidates, per §5.2):** (1) before invoking P-002, confirm the same channel actually
  failed twice — location and mechanism matter, not just topical resemblance (extends D-032's own diagnosis of
  FINDING 8 into a reusable check). (2) when two open findings share a prompt section, model the fix for one
  against the other before choosing, rather than resolving them as if independent.
- **Date raised:** 02-Aug-2026
