# Phase 1 — Run 4 Results (prompt v0.6, Q1 vs. both fixtures)

**Run date:** 01-Aug-2026
**Setup:** Anthropic Console Workbench, `claude-sonnet-5`, default temperature, system prompt =
`SYSTEM_PROMPT_v0_6_runnable.md`, user turn = fixture JSON + Q1's text, fresh conversation per run. Run
manually by the owner (no scripted API access from build-home); outputs pasted back to Claude Code for
scoring against `TEST_PROTOCOL.md`.

**Purpose (BQ-003, traces to D-027 FINDING 4):** Run 2 (v0.3, `FIXTURE_user_01.json`) showed the model
choosing which path to deepen on its own, justified by rate ("since that's the rate doing the most damage
per rupee") — FINDING 4, resolved by D-028 (backend `deepen` field; absent means deepen nothing, equal
shallow treatment). Neither fixture used here carries a `deepen` field, so both runs test the absent case.
`FIXTURE_user_02.json` (BQ-002) exists specifically to separate two explanations for FINDING 4: was the
model reasoning about genuine magnitude (Card-1 at 42% is a real outlier), or does the deepen-one channel
operate regardless of whether a "sharpest" number exists? Comparing the two fixtures is the test.

**Questions run:** Q1, against both fixtures, plus one repeat of Run A (see addendum below). **Not run:**
Q2–Q6, Q8 against v0.6 (out of scope for BQ-003).

---

## Results table

| | Run A — `FIXTURE_user_01.json` (Card-1 at 42%, dominant) | Run B — `FIXTURE_user_02.json` (Loan-1 8.8% / Loan-2 13.5%, no dominant number) |
|---|---|---|
| Opens on their numbers | Pass | Pass |
| Names every path, deepens none (D-028 absent-case) | Pass — no explicit selection, no severity-based justification, roughly equal treatment across paths | **Pass, and notably cleaner** — three paths (two loans + invest) with genuinely comparable depth, and the two close-magnitude debts (8.8%/13.5%) are described without either being framed as the sharper problem |
| Spots the fixture's "third path" trap | **FAIL — Card-1 (42%) never mentioned.** A "hold as cash" path is offered instead, but the fixture's actual highest-cost holding is dropped entirely. | **Pass** — surfaces Loan-2 (the personal loan, 13.5%) as the path the user's question didn't name, with its own numbers |
| Equal vividness across paths (§2 rule 4) | Partial — prepay gets a hard "well over ₹2 lakh" figure; invest gets Fund-A's 3-year history but no forward number/range; cash gets a concrete months-of-cover figure | Similar pattern — both loan paths get comparable concrete framing; invest again gets no forward number/range, only "uncertain return" |
| Open door, on-topic (§2 rule 3, D-032) | Pass — offers to go deeper on prepayment mechanics, already discussed | Pass — same shape, also prepayment mechanics |
| Never picks a winner | Pass — no "you should," closes on the tradeoff standing unresolved | Pass — explicitly does not rank the two loans by rate despite the question inviting it |
| Length | 306 words (target 200–300, ceiling 320 — 6 over target, within ceiling) | 252 words (inside target) |

---

## The FINDING 4 question, answered: it does NOT reproduce in either fixture

Neither run shows Run 2's specific failure shape — no explicit "I'll go deep on X because Y" language, no
reference-frame capture (other paths narrated through one path's lens), no severity/urgency justification for
depth. D-028's fix (deepen absent → deepen nothing, equal shallow treatment) holds in both the dominant-number
and no-dominant-number fixture. Run B is the more interesting confirmation: `FIXTURE_user_02.json` was built
so that Loan-1 (8.8%) and Loan-2 (13.5%) sit close enough that picking a "sharper" one is a genuine judgment
call, and the model still didn't pick — it described both without ranking, which is the harder version of the
same test to pass. **FINDING 4, as originally shaped, appears resolved and does not appear to be an artifact
of user_01's loud number** — it holds under the harder condition too.

---

## FINDING 9 (new) — Run A drops the fixture's own trap: Card-1 (42%) is never mentioned

`FIXTURE_user_01.json` exists partly to test whether the model surfaces Card-1 unprompted (D-024's original
Run 1, prompt v0.2, passed this and it was treated as evidence of reasoning over the profile rather than
mimicry of the D-015 worked example). Run A here — same fixture, prompt v0.6 — never mentions Card-1 at all.
It is not simply "went straight to prepay-vs-invest" (`TEST_PROTOCOL.md`'s named failure shape); the model
added a third path of its own (holding the money as cash / emergency-fund cover), but the fixture's actual
highest-cost, most-relevant holding is absent from the answer entirely.

**This is a different failure shape from FINDING 4, not a reappearance of it.** FINDING 4 was the model
*over*-attending to Card-1 (picking it to deepen, justified by its rate). This is the model *under*-attending
to it — dropping a materially relevant, high-cost holding from the path list altogether. The two chains of
fixes (D-025, D-028, D-032) were all aimed at the model saying or structurally implying too much about which
holding matters most. None of them were aimed at completeness — whether every genuinely relevant holding gets
named at all (§2 rule 2's own requirement). It is worth checking whether D-032's on-topic tightening of the
*closing* offer (§2 rule 3) got over-applied by the model to the *opening* path-naming step too — i.e. whether
"don't introduce things the user didn't raise" bled from the closing-thread rule into path selection, even
though nothing in §2 rule 2 or rule 5's "mentioning a holding the user's question did not name" carve-out
restricts that. Not confirmed — this is n=1, and Run B has no card-equivalent holding to test the same
omission against (Loan-2 WAS caught there). **Flagged for thinking-home, not resolved here** — this doesn't
match BQ-003's stated escalate-if condition (D-028's `deepen` field behaving differently), so it isn't a
result of the deepen mechanism at all; it's a new, separate observation about §2 rule 2's "name every path"
guarantee.

---

## Addendum — repeat series (n=5): FINDING 9 confirmed at a real rate; FINDING 10 discovered

Same setup as Run A every time (`SYSTEM_PROMPT_v0_6_runnable.md`, `FIXTURE_user_01.json`, Q1, fresh
conversation, default temperature), run four more times per this file's own recommended next action, before
FINDING 9 was taken to thinking-home. **Supersedes the single-repeat addendum previously here** — one clean
repeat had made the omission look like noise; the full series does not support that read.

| Run | Card-1 named? | FINDING 10 (unprompted gap surfacing)? | Length | Note |
|---|---|---|---|---|
| A (original) | **MISS** | No | 306 | Substitutes a "hold as cash" third path for Card-1 |
| Repeat 1 | Hit | No | 272 | Clean |
| Repeat 2 | Hit | **YES** | 263 | Surfaces the term-insurance gap unprompted, mid-answer |
| Repeat 3 | Hit | No | 254 | Clean |
| Repeat 4 | **MISS** | No | 268 | Substitutes emergency-fund/liquidity framing for Card-1; opens "there are two things you could do with it," echoing Run A's exact framing |

**Card-1 omission: 2/5 (40%).** Not noise — a real, substantial reproduction rate for a fixture built
specifically to test whether the highest-cost holding gets named. **Both misses share a qualitative
pattern**: neither goes straight to prepay-vs-invest (`TEST_PROTOCOL.md`'s named failure shape); both instead
reach for the emergency-fund/liquidity consideration as a substitute third thing to discuss, rather than
Card-1. That's a specific substitution, not a random drop — worth carrying into the brief as a candidate
explanation: the model may be treating "liquidity of the ₹2 lakh itself" and "another debt entirely" as
competing slots for a third thing to add, and picking between them rather than reliably including both.

**FINDING 10: 1/5 (20%).** Lower rate, but this is the more urgent finding of the two — see below.

**FINDING 4's absence, and D-028's fix, held across all 5 runs.** No run showed explicit path-selection
language, severity-based justification, or reference-frame capture, including the two runs that dropped
Card-1. The omission is a completeness failure, not a resurfacing of the deepen-one ranking channel.

---

## FINDING 10 (new) — Repeat 2 volunteers the term-insurance gap, unprompted, on a question that never touched it

Repeat 2's answer, before its closing summary, inserted this paragraph unprompted:

> "One other thing sits in the picture: you're carrying ₹40 lakh of debt with a spouse and a four-year-old,
> and there's no life cover recorded anywhere. That debt doesn't disappear if you do — it lands on whoever
> inherits the house."

Q1 asks whether to prepay the home loan or invest ₹2 lakh — nothing in it touches life insurance, and the
gap is not part of "the room the user is already in" (home loan, Card-1, investing) that D-032's on-topic
rule requires for §2 rule 3. This is not the closing "open door" itself — that part (offering to go deeper on
prepayment mechanics) was on-topic and fine — the gap is asserted mid-answer as an added fact, separate from
the close.

**This is not a new hypothesis — D-032 pre-registered exactly this outcome as its own falsification
condition:**

> "if a future run shows the model volunteering an unraised gap in a context Path B's on-topic constraint
> does not catch (e.g. a question that is finance-adjacent but should still not trigger surfacing), that is
> new evidence Path B is insufficient — the next step would be Path A's broader gate."

Q1 is finance-adjacent (it's a question about money) but never raises insurance — precisely the case D-032
named. This didn't happen on Q7 (FINDING 8's original channel, an explicitly off-topic memory question) — it
happened on Q1, a fully on-topic financial question that simply never touched this particular gap. That's a
new, broader channel than the one D-032's fix targeted, and by D-032's own stated logic this single
occurrence is already "new evidence Path B is insufficient," independent of its 1/5 rate.

**Flagged for thinking-home as the more urgent of the two findings this run** — it touches the compliance
line directly (§2 rule 3, gap-surfacing scope) and matches a condition the prior decision named as sufficient
evidence on its own, rather than requiring a reproduction-rate argument the way FINDING 9 does.

---

## What held

- **D-028's deepen-absent guarantee is robust across both fixtures**, including the harder no-dominant-number
  case it was specifically built to test.
- **§3 rule 5 (never rank) held under real ambiguity** — Run B's two close-magnitude debts were described
  without either being framed as more urgent, exactly the scenario the rule is meant to survive.
- **D-032's on-topic open-door rule held in both runs** — both closing offers extend a mechanism already
  discussed in the same answer (prepayment), not an unraised topic.
- **Investing consistently gets the thinnest treatment of the named paths in both runs** — not flagged as a
  failure (nothing in §2/§3 requires a forward return figure, and inventing one would risk D-029's provenance
  rule), but worth watching: if this pattern holds across more questions, it may be a §5 calibration note
  rather than a compliance one.

---

## What has NOT been tested

- Q2–Q6, Q8 against v0.6 — only Q1 was in scope for BQ-003.
- Run B (`FIXTURE_user_02.json`) is still n=1 — only Run A was repeated. Unknown whether Loan-2's capture
  rate is as leaky as Card-1's, or whether FINDING 10's gap-surfacing recurs there too.
- Whether FINDING 9's 40% rate or FINDING 10's 20% rate hold up at larger n, or on a fixture where the loud
  number is even more extreme.
- Whether the two misses' shared "substitutes emergency-fund/liquidity for Card-1" pattern is real or a
  5-sample coincidence.

---

## Recommended next actions

1. **Both findings go to thinking-home.** FINDING 9 is no longer a single data point — 2/5 (40%) on identical
   setup is a real rate, not noise, and both misses share a specific substitution pattern worth including in
   the brief. FINDING 10 is more urgent despite its lower rate (1/5): it matches D-032's own pre-registered
   condition for "Path B is insufficient," on a new and broader channel (Q1, not Q7) than the one D-032's fix
   targeted.
2. Repeat series against Run A — **done** (n=5, see addendum above).
3. Consider whether FINDING 10 alone is sufficient grounds to move to D-032's Path A (a broader Trigger-A/B
   gate) per its own stated logic, independent of further reproduction — that determination is thinking-home's
   to make, not build-home's.
4. BQ-003 itself is closed: FINDING 4 does not reproduce in either fixture, including the harder
   no-dominant-number case it was built to isolate. That result is unaffected by FINDING 9/10.
