# D-028 — BRIEF-002 RESOLVED: the model no longer chooses which path to deepen (Path C, stubbed)
- **Tier:** 3 — owner decision on the brief raised by D-027.
- **Interprets:** D-025 — settles that prioritisation includes STRUCTURAL prioritisation (which path gets
  explained), not only stated prioritisation. D-025 still governs; this states what it means in a channel
  D-025 did not reach.
- **Supersedes:** D-015 in respect of §2 rule 2's selection clause only — "then go deep on one" no longer
  means the model chooses. The rest of D-015 (rules 1, 3, 4, the four dimensions, the worked example) stands
  unchanged.
- **Decision (Path C):** Selection of the deepened path moves OUT of the model. The profile slice carries an
  optional `deepen` field — `{"alias": "Loan-1", "reason": "the user asked about prepaying this loan"}` — set
  by the backend. The model follows it and does not choose. This is the D-010 move applied a second time: a
  policy the model must follow becomes a guarantee the architecture provides, auditable in code rather than
  in per-response judgment.
- **Three sub-decisions, all owner calls, all needed to keep C's guarantee intact:**
  1. **Absent field means DEEPEN NOTHING, not model's discretion.** Equal shallow treatment of every named
     path (Path B behavior), then offer the threads. This was the critical one: "model's discretion when
     absent" would have handed the selection straight back and made C ineffective for every question the
     backend cannot classify — which will be most of them early on. Net effect: **C for the cases the backend
     can decide, B for the ones it cannot. No case falls back to model discretion.**
  2. **Not silent — the field carries a reason the model may state.** A backend-authored reason cannot be a
     ranking the model invented. The model may bridge using that reason in its own words, and is explicitly
     forbidden from substituting its own or justifying by rate, size, urgency, or severity — the Run 2 Q1
     failure ("since that's the rate doing the most damage per rupee") is named in the prompt as forbidden.
  3. **Stub now, backend later.** C adopted as the decision immediately, with the `deepen` field hand-written
     into fixtures for Phase 1 testing to simulate what the backend will do. This decouples "the model does
     not choose" (settled and testable now) from "here is how the backend chooses" (a real design problem
     deserving its own decision). **The backend selection logic is NOT decided by this entry.**
- **Also written into the prompt:** §2 rule 2 now names reference-frame capture explicitly — describing other
  paths through the lens of one of them ("the loan keeps running while the card compounds against you") makes
  that path the frame even when it is not the deepened one. Run 2's Q1 did this to both non-deepened paths.
- **Why C over A, B, or the narrow option:** A (user's question determines depth) and D (ban only the stated
  justification) are cheap and partial — both leave the model making the selection, and D would have been the
  third consecutive fix aimed at what the model SAYS rather than what it DOES. B closes the channel but
  contradicts D-015 rule 2 as a general rule and risks the drift-to-uselessness edge D-015 itself named. C is
  the only option that removes the decision from the model rather than constraining it. Decisive factor: the
  same behavior had already re-routed twice (Run 1: phrase blocklist → "worth"; Run 2: sentence-level rule →
  structure), which is evidence about the instrument, not the rule. Note that B was not discarded — it is now
  the fallback behavior under sub-decision 1.
- **Known cost, accepted:** the hard question is relocated, not answered. The backend needs a rule for what to
  deepen, and that rule is the same judgment one layer down — possibly harder to express in code than in
  prose, and without the model's contextual read of the question. That decision is deliberately deferred and
  must be escalated on its own; it will fire trigger 5 when it comes.
- **Rule extraction (per protocol §5.2), two tests now available:**
  1. **"Does the rule govern what the model SAYS, or what the model DOES?"** A wording-level rule can be
     satisfied while the same judgment moves into structure. When a behavior re-routes after a wording fix,
     the next fix must govern the act.
  2. **"When a prompt-level rule has been routed around twice, the third attempt should be architectural."**
     D-010 established this pattern for product names; D-028 is its second application. Future decisions of
     this shape are now Tier 2 applications of a set test rather than Tier 3 judgments.
- **Also fixed in the same pass (mechanical, not separate decisions):** §1 gains a no-self-narration line
  closing Run 2's FINDING 5 — the model may not announce what it is or is not doing ("I've stated them, not
  ranked them"), because it makes the machinery visible, invites testing, and was untrue in context.
- **Reversibility:** High at prompt level. The backend dependency is future work not yet built, so nothing is
  committed in code.
- **Feeds:** system prompt §1, §2 rule 2, §4. Regenerated as SYSTEM_PROMPT_v0.4_runnable.md. Fixtures:
  base (no `deepen`, tests the fallback) + `FIXTURE_user_01_deepen_Loan1.json` (tests obedience).
- **Date:** 23-Jul-2026
