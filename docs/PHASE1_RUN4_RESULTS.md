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

## Addendum — repeat of Run A: Card-1 omission does NOT reproduce

Same setup as Run A (`SYSTEM_PROMPT_v0_6_runnable.md`, `FIXTURE_user_01.json`, Q1, fresh conversation,
default temperature), run again per this file's own recommended next action #2, before FINDING 9 was taken
to thinking-home as a settled regression.

**This time Card-1 is named, with correct fixture numbers** (₹86,000 outstanding, 42%, ₹4,300 minimum due,
~₹36,000/year interest if left at the minimum), alongside Loan-1 and Fund-A. Full checklist:

| Checklist item | Result |
|---|---|
| Opens on their own numbers | Pass |
| Names every path, including Card-1 | **Pass** — the trap Run A missed is caught here |
| Deepens none (D-028 absent-case) — no selection/severity language | Pass — three paths, comparable depth, no "I'll go deep on X because Y" |
| No reference-frame capture | Pass — each path described on its own terms |
| Equal vividness | Partial, same pattern as Run A/B — invest again gets no forward number, loan and card both get hard rupee figures |
| Never picks a winner, even with 42% in view | Pass — Card-1's minimum-due trap is described factually ("the balance grows faster than the payment shrinks it"), not as "the one to fix first" |
| Open door, on-topic (D-032) | Pass — offers to go deeper on amortisation or the SIP, both already discussed |
| Length | 272 words (inside 200–300 target) |

**Read on FINDING 9:** with the omission now 1-for-2 across identical setup/fixture/question, it looks more
like run-to-run variance at default temperature than a stable regression. This doesn't rule out a real
weakness — n=2 is still thin, and the hypothesis in the FINDING 9 section above (possible bleed from D-032's
on-topic closing-rule into path-naming) isn't disproven by one clean repeat — but the evidence is
meaningfully weaker than it was when this file first went to the owner. Worth factoring in before carrying
"confirmed regression" into a thinking-home brief; a few more repeats (and/or a repeat of Run B) would settle
whether this is signal or noise.

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
- Repeat runs — both Run A and Run B are n=1; FINDING 9 in particular should not be treated as confirmed
  behavior until re-run.
- Whether FINDING 9 reproduces on a fixture where the "loud number" is even more extreme, or whether it's
  specific to this exact profile/question pairing.

---

## Recommended next actions

1. **Owner reviews FINDING 9 in light of the addendum** — 1-for-2 on identical setup weakens the case for a
   confirmed regression, without eliminating it. Decide whether it still warrants a thinking-home brief now,
   or whether a few more repeats (cheap — same prompt, same fixture, same question) should run first to get a
   real reproduction rate before writing one.
2. ~~Repeat run of Q1 against `FIXTURE_user_01.json`~~ — **done, see addendum.** Omission did not reproduce.
3. BQ-003 itself is closed: FINDING 4 does not reproduce in either fixture, including the harder
   no-dominant-number case it was built to isolate.
