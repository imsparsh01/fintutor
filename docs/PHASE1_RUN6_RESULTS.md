# Phase 1 Run 6 Results — BQ-008 (D-037 verification)

**Date:** 2026-08-02/03
**Prompt version:** SYSTEM_PROMPT_v0_8_runnable.md
**Fixture:** FIXTURE_user_01.json
**Question:** Q1 — "I've got ₹2 lakh spare. Should I put it on the home loan or invest it?"
**Runs:** n=5, fresh/independent calls
**Purpose:** Verify D-037's fix (materially higher-cost holding, i.e. Card-1, must be named
even when outside the two named paths).

## Note on the run itself

The first attempt at this run (`bq008_20260802_234744`) came back 3/5 valid, 2/5 empty
with no error. Diagnosis found the empty responses had `stop_reason=max_tokens` with
`thinking_tokens` consuming the entire 1024-token cap — the test script's `max_tokens`
was too low for a model that reasons before producing visible output, so two of five
calls spent their whole budget thinking and never emitted answer text. This was a test
script bug, not a prompt or compliance issue. Fixed by raising the script's default
`max_tokens` from 1024 to 4096 (`scripts/run_phase1_test.py`). Re-run
(`bq008_20260802_235827`) came back clean, 5/5.

The scoring below is against the clean 5/5 run: `docs/sessions/test_outputs/bq008_20260802_235827/`.

## Scoring

| # | Words | Card-1 named unprompted (D-037) | Gap surfacing (FINDING 10) | "Worth" phrasing vs D-036 test | Within 320 ceiling |
|---|-------|----------------------------------|------------------------------|----------------------------------|----------------------|
| 1 | 304   | Yes — opening paragraph          | None                          | Clean (no ordering/comparative word on a "worth" clause) | Yes |
| 2 | 313   | Yes — opening paragraph          | None                          | Clean | Yes |
| 3 | 267   | Yes — opening paragraph          | None                          | Clean | Yes |
| 4 | 276   | Yes — opening paragraph          | None                          | Clean | Yes |
| 5 | 287   | Yes — opening paragraph          | None                          | Clean | Yes |

**FINDING 9 (Card-1 dropped): 5/5 fixed.** Every run names the ₹86,000/42% card,
unprompted, before or immediately alongside laying out the two asked-about paths — not
substituted with a vaguer consideration (no run swapped it for a generic liquidity or
emergency-fund line instead of naming the card itself).

**FINDING 10 (unprompted gap surfacing, e.g. no_term_insurance): still 0/5.** No run
introduces a profile gap the user didn't ask about. Confirms BRIEF-004/D-035's fix holds
under this prompt version too.

**FINDING 11 ("worth X" bridging into the banned phrase): 0/5 violations under D-036's
clarified test.** Several runs use "worth naming," "worth knowing," "worth having in
front of you," "worth sitting with the numbers" — none of these carry a comparative or
ordering word (e.g. "first," "more than") directly modifying the recommendation itself,
which is the line D-036 drew. Runs 2 and 5 do use comparative language ("matters more
than either," "does the most work") but as factual rate/cost comparisons (42% vs 9% vs
3%) rather than as ranking between the two decision paths — consistent with §2's
"vivid consequences" and "provenance of numbers" teaching rules, not a §3 rule 5
violation.

**Word count / ceiling:** all 5 runs land between 267 and 313 words — inside the
200-300 target band or just over it, and comfortably under the 320 hard ceiling. No
repeat of Run 5's 344-word overshoot from BQ-007.

## Conclusion

D-037's fix is verified. BQ-008 closes clean — moving to DONE in BUILD_QUEUE.md.
