# D-035 — BRIEF-004 RESOLVED: Path A adopted — on-topic gap-surfacing constraint extended to the whole answer
- **Tier:** 3 — owner decision on the brief raised as BRIEF-004. Interprets a compliance-category decision
  (D-032), so Tier 3 only per protocol §4.3, no exception for interpretations that tighten.
- **Interprets:** D-032 — settles that the "on-topic only" gap-surfacing constraint D-032 wrote for the
  closing "open door" move also governs the rest of the answer, not just the close. D-032 still governs;
  this states what it means for a location D-032's own wording did not explicitly reach (the mid-answer
  insertion FINDING 10 used).
- **Decision (Path A, the narrow patch):** §2 rule 3 gains two new paragraphs. First, the on-topic test
  ("is this thread already in the room, or a new door?") now explicitly applies anywhere in the answer, not
  only at the close — closing the exact channel FINDING 10 exploited (inserting the term-insurance gap
  mid-answer, dressed as "one other thing worth knowing"). Second, an explicit guard clause: this rule
  governs introducing something *new* (an unraised gap) and does not loosen §2 rule 2's requirement to name
  every already-relevant holding — added specifically because the brief flagged the risk that a broadly
  worded fix here could bleed into and worsen FINDING 9 (the model already drops Card-1 from answers 2/5
  runs). Chosen over BRIEF-004's Path B (a standalone gate covering all unprompted surfacing, regardless of
  location) and Path C (backend-mechanical `surfaceable_gaps` field) — owner judged this a first attempt at
  a plausibly new channel (Reading 2 in the brief: the mid-answer insertion is a location no prior rule
  addressed, not a second failure of the closing-offer rule D-032 already fixed), not yet evidence the rule
  family needs Path B's broader scope or Path C's architecture.
- **FINDING 9 is explicitly NOT addressed by this decision.** It remains open, still needs its own path, and
  is not resolved by this entry — recorded here so it is not mistaken for closed alongside FINDING 10.
- **Why Path A:** narrowest fix that closes the specific demonstrated channel, lowest risk of the
  cross-contamination the brief warned about (Path B's broader wording was the path most likely to make
  FINDING 9 worse), and consistent with treating this as a first attempt at a genuinely new location rather
  than P-002's "routed around twice" territory — which would have required treating FINDING 8 and FINDING 10
  as the same channel, a reading the owner did not adopt.
- **What only the owner judged:** whether FINDING 10 was Reading 1 (D-032's own pre-registered
  falsification, rate-independent) or Reading 2 (a new channel, first attempt legitimate) — owner went with
  Reading 2, accepting the risk named in the brief that if a fourth channel appears, this counts as a second
  routed-around attempt and the next fix should go to Path B or C per P-002.
- **Held in reserve:** if a future run shows unprompted gap-surfacing through yet another location or
  mechanism (not mid-answer insertion, not the closing offer), that is the second failure of this rule
  family and the next fix should go straight to Path B or C, per P-002 — do not attempt a third
  location-specific patch.
- **Reversibility:** High — prompt-level text, tunable in further Phase 1 testing, same standing as
  D-025/D-028/D-029/D-032.
- **Feeds:** `TEACHING_SYSTEM_PROMPT.md` §2 rule 3 (two new paragraphs). Regenerated as
  `SYSTEM_PROMPT_v0_7_runnable.md`.
- **Date:** 02-Aug-2026
