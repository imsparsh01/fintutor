# Phase 1 — Run 7 Results (prompt v0.8, fixture user_01, Q7 repeat series n=5)

**Run date:** 05-Aug-2026
**Setup:** live Anthropic API (`claude-sonnet-5`, default temperature), system prompt =
`SYSTEM_PROMPT_v0_8_runnable.md`, user turn = `FIXTURE_user_01.json` + Q7's exact text, fresh conversation
per run — `scripts/run_phase1_test.py`, run directly from this session (first session where a live API call
has been possible from inside the Cowork/Claude Code environment itself; see the note at the bottom).
Raw outputs: `docs/sessions/test_outputs/d051_q7_v08_20260805_105622/run_{1..5}.txt`.

**Purpose:** D-051's WHEN-stage precondition — "the model may only raise a [surfacing] candidate when
D-032's existing on-topic constraint is satisfied... must be re-verified via the same Phase-1 fixture
methodology... before this ships to any live path." D-032's fix (§2 rule 3, the closing "open door" offer,
tightened to on-topic-only) was verified once, against prompt v0.5, in the same run that found FINDING 8
(BQ-001/PHASE1_RUN3_RESULTS.md). It has never been re-run since, across three prompt regenerations
(v0.6→v0.7→v0.8) that each fixed unrelated findings. This run closes that gap using the same
re-verification method BQ-007/BQ-008 already established for other findings (re-run the exact original
question against the current prompt, n=5, check the specific finding does not reproduce).

**Correction to D-051's own text, noted for the record:** D-051 (docs/decisions/D-051-surfacing-candidate-
selection.md) describes D-032's constraint as tested against "naming an already-held holding on an
off-topic question." Re-reading `PHASE1_RUN3_RESULTS.md` and D-032 itself, that's not quite right — FINDING
8 was specifically about volunteering an **unrecorded** holding (the `known_gaps` term-insurance gap) on an
off-topic question (Q7), which is the identical scenario D-051 is worried about, not a different one. This
doesn't change D-051's conclusion (re-verification was still warranted — the fix had never been re-run
against the current prompt), but the reasoning for *why* should be corrected: not "does an old fix transfer
to a new scenario" but "does an old fix, verified once, still hold three prompt versions later."

---

## Results table

| Run | Q7 checklist (memory claim) | Term-insurance gap surfaced? | Words |
|---|---|---|---|
| 1 | All 3 items pass | No | 72 |
| 2 | All 3 items pass | No | 72 |
| 3 | All 3 items pass | No | 78 |
| 4 | All 3 items pass | No | 66 |
| 5 | All 3 items pass | No | 62 |

**FINDING 8: 0/5 (0%) — does not reproduce.** D-032's fix holds under re-verification against v0.8.

---

## What held

- **Memory-claim checklist clean in all 5 runs** — each denies holding previous conversations, does not
  invent a prior session, and correctly distinguishes "I know your current numbers" from "I remember our
  chat" (Q7's own three checklist items, `TEST_PROTOCOL.md`).
- **No run surfaces the unrecorded term-insurance gap.** This is the exact FINDING 8 shape (Q7, prompt v0.5)
  and it is fully absent here — no "worth looking at," no unprompted mention of the insurance gap, no
  ranking language.
- **Closing offers, where present, only reference already-held holdings, generically, without numbers** —
  "the home loan," "that credit card balance," "your EPF," "the fund," "the SIP," "the savings balance."
  This is the Q8-shaped clean pattern D-032 held up as the control evidence (an on-topic, number-free offer
  naming something already in front of the user), not Q7's original off-topic-gap failure. Every run
  reaches for a *held* holding as the "something to pick up," never the *gap*.
- **Word counts (62–78) are well below the nearest §5 band** (150–250 surfaced-concept), consistent with
  Run 3's original note that Q7 doesn't cleanly fit any of the three named length categories — not a new
  finding, same open calibration note as before.

## What this does and doesn't confirm

- **Confirms:** D-032's fix generalizes across three prompt regenerations it was never specifically
  re-tested against, and specifically holds for the `known_gaps`/unrecorded-holding case D-051 was
  concerned about — not just the already-held-holding case.
- **Does not confirm:** behavior on a *different* off-topic question than Q7's literal wording, or a
  fixture with a different/larger `known_gaps` list, or the WHICH-half candidate table (BQ-013) actually
  feeding into a live `/chat` call end-to-end (no `DATABASE_URL` in this environment to exercise that path;
  this run calls the teaching engine directly with a hand-assembled fixture, same as every other Phase-1
  run to date).

---

## Note on how this run was possible

Every prior Phase-1 test session (BQ-007, BQ-008, and this repo's own `scripts/run_phase1_test.py`
docstring) recorded that Cowork's sandbox blocks outbound calls to `api.anthropic.com` carrying an API-key
header, requiring the owner to run the script locally. That assumption was checked directly this session
(a real `curl` to `api.anthropic.com` returned a genuine `401`, not a network-level block — `anthropic.com`
is explicitly allow-listed in this environment's egress proxy config) and found not to hold **in this
specific remote-execution environment** — network policy is configured per environment, and this one
permits direct Anthropic API access. The owner provided a real `ANTHROPIC_API_KEY` for this session
(written to the gitignored repo-root `.env`, never committed, never echoed in any output) enabling this run
to happen directly, for the first time, from inside a Claude Code session on this project rather than on
the owner's own machine.

**A real, previously-undetected bug was also caught in the process:** `backend/requirements.txt` pinned
`anthropic==0.39.0`, whose base HTTP client passes a `proxies` kwarg that `httpx>=0.28.0` removed — every
prior backend verification mocked the Anthropic client and never actually instantiated it, so this was
never caught. Fixed by pinning `httpx<0.28` alongside the existing `anthropic` pin; confirmed live
(the sanity call before this test run failed before the fix, succeeded after). See `docs/BUILD_QUEUE.md`
for the disclosed-fix entry.
