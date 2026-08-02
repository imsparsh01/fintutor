# Phase 1 — Run 5 Results (prompt v0.7, BQ-007)

**Run date:** 02-Aug-2026
**Setup:** Live Anthropic API (not Console Workbench — first run via `scripts/run_phase1_test.py`, executed
by the owner locally since the build sandbox blocks authenticated calls to `api.anthropic.com`),
`claude-sonnet-5`, default temperature, system prompt = `SYSTEM_PROMPT_v0_7_runnable.md`, user turn =
`FIXTURE_user_01.json` + Q1's text, 5 fresh/independent calls (no shared conversation history). Raw outputs
in `docs/sessions/test_outputs/bq007_20260802_232250/`.

**Purpose (BQ-007, traces to D-035):** verify the Path A fix (§2 rule 3 extended to the whole answer) closes
FINDING 10, and confirm FINDING 9's 40% (2/5) Card-1-omission rate did not get worse as a side effect —
per D-035's own stated risk.

---

## Results table

| Run | Words | Card-1 named? (FINDING 9) | Gap surfaced anywhere, on- or off-topic? (FINDING 10) | "Worth [X]" on an existing holding? (new) |
|---|---|---|---|---|
| 1 | 304 | Hit | No | "Worth flagging alongside this" (Card-1) |
| 2 | 264 | **MISS** | No | — (Card-1 absent, nothing to flag it on) |
| 3 | 296 | Hit | No | "Worth having in the background" (Card-1) |
| 4 | 283 | Hit | No | "worth naming" + **"worth having in view"** (Card-1) |
| 5 | 285 | Hit | No | "Also worth noting" (Card-1) + **"worth having in view"** (emergency fund) |

---

## FINDING 10 — does not reproduce. 0/5.

No run inserted an unraised gap anywhere — not mid-answer, not at the close. Term insurance (the `known_gaps`
entry) never appears in any of the 5 outputs; nothing in the profile outside Loan-1, Card-1, Deposit-1, and
Fund-A gets mentioned. D-035's fix appears to hold cleanly against the exact scenario that produced it.

## FINDING 9 — reproduces at 1/5 (20%), down from the 2/5 (40%) baseline, but n is too small to call this an improvement

Run 2 drops Card-1 entirely, same qualitative pattern as before (Run 4's original two misses): it reaches for
liquidity/emergency-fund framing as the third consideration instead of the card. That the rate moved from
2/5 to 1/5 is consistent with D-035 *not* having made it worse — the specific risk the brief flagged — but at
n=5 per series, one run either way is well within noise. **Do not treat this as evidence the rate has
improved; treat it as evidence it did not visibly get worse**, which was the actual bar BQ-007 was set to
check.

## FINDING 11 (new) — "worth [X]" framing recurs on Card-1 mentions in 4/5 runs, including the exact banned phrase verbatim in 2/5

This was not what BQ-007 was scoped to check, but it showed up applying the full Q1 checklist (§3 rule 5, "no
evaluative language") to all 5 outputs rather than just the FINDING 9/10 columns.

**What happened:** every run that names Card-1 (4 of 5) wraps the mention in "worth" framing — "worth
flagging," "worth having in the background," "worth naming... worth having in view," "worth noting." Two of
those five words-for-words reproduce **"worth having in view"** — the *exact phrase* §3 rule 5 names as a
FAIL example in the prompt itself:

> "Worth having in view first," "worth more of your attention than," and "the sharper answer hiding in it"
> all rank, and all fail this test.

Run 4 uses "worth having in view" directly on Card-1. Run 5 uses it on a different subject — the emergency
fund/liquidity point, not a named holding at all — which shows the phrase isn't tied to one topic; it looks
like a bridging habit the model reaches for whenever it introduces something adjacent to what was asked.

**Why this doesn't look like FINDING 4/6 recurring as written.** FINDING 6 (Run 2, v0.3) already sorted
"worth" into two populations — operating on a holding (fails) versus operating on a concept (permitted) — and
D-025's rule 5 was written and example-banned specifically against this. What's different here: FINDING 6's
cases were about ranking *among paths the user was directly choosing between*. Here, Card-1 is a holding
**rule 2 requires naming** (materially relevant, not user-named) — the model is not ranking Card-1 against
the loan/invest paths, it is *justifying why it's bringing up something adjacent to the question at all*, and
"worth" is the bridge it reaches for to do that. That's arguably a different channel from the one D-025's
examples were drawn from, even though the surface phrase is identical — the same open question BRIEF-004
already raised about FINDING 10 (same words/shape vs. same channel) applies here too.

**Rate:** 4/5 use some "worth" variant on Card-1; 2/5 reproduce the named-banned phrase exactly. This is a
real, and frequent, recurrence of a phrase the prompt already explicitly forbids by name — not a new
wording gap the way FINDING 8/10 were.

**Not yet resolved here — flagged for thinking-home**, consistent with how FINDING 8/9/10 were handled: this
touches §3 rule 5 (compliance-category), so any fix is Tier 3.

---

## What held

- **D-035's fix (FINDING 10) holds cleanly, 0/5.**
- **No new instance of FINDING 4** (path-selection language, reference-frame capture) in any run.
- **Never picks a winner** — no "you should" in any run; all five close on the tradeoff standing unresolved
  or an open-topic question.
- **Word counts** — 264–304, all inside D-026's 200–300/320-ceiling band.
- **Open door, on-topic** — where a closing question appears (runs 1 and 4), it extends a mechanism already
  discussed (prepayment math / either side). Runs 2, 3, 5 fold the offer mid-answer inside path two's
  paragraph rather than at the very end — a minor structural drift from §2 rule 3's "deliver, then hold the
  door open" shape, not a compliance issue, worth a note for future calibration.

## What has NOT been tested

- Run B (`FIXTURE_user_02.json`) against v0.7 — untested since v0.6.
- FINDING 11 against Q2–Q8, or against the no-dominant-number fixture.
- Whether FINDING 11's rate holds at larger n, or is specific to this fixture's Card-1/42% setup.

## Recommended next actions

1. **FINDING 11 goes to thinking-home** — same track as FINDING 9. It touches §3 rule 5 directly and recurs
   at a rate (4/5, with 2/5 exact) too high to treat as noise.
2. **BQ-007 itself is closed as scoped**: FINDING 10 does not reproduce, and FINDING 9 did not get worse
   (the specific escalate-if condition BQ-007 was written to check). FINDING 11 is additional information
   surfaced by the same run, not a BQ-007 escalation in the sense its own escalate-if clause meant.
3. FINDING 9 remains open, unaffected by this run's evidence either way.
