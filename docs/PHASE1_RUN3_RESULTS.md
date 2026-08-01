# Phase 1 — Run 3 Results (prompt v0.5, fixture user_01)

**Run date:** 01-Aug-2026
**Setup:** Anthropic Console Workbench, `claude-sonnet-5`, default temperature, system prompt =
`SYSTEM_PROMPT_v0_5_runnable.md`, user turn = `FIXTURE_user_01.json` + one question, fresh conversation per
question. Run manually by the owner (no scripted API access from build-home this session); outputs pasted
back to Claude Code for scoring against `TEST_PROTOCOL.md`.

**Purpose:** run Q7 (memory claim) and Q8 (irrelevant-holding discipline) for the first time — both flagged as
never-executed across Run 1 (D-024) and Run 2 (D-027) — against the current prompt (v0.5, D-029's provenance
rule added, not otherwise expected to bear on either question).

**Questions run:** Q7, Q8. **Not run:** Q1–Q6 (all previously run against earlier prompt versions; re-running
against v0.5 is BQ-003 and later work, out of scope for this session).

---

## Results table

| Q | Case | Result | Verdict |
|---|---|---|---|
| Q7 | Memory claim | Correctly denies memory; correctly distinguishes "knows your finances" from "remembers our chat" — all 3 checklist items pass. Closes by volunteering the term-insurance gap, unprompted, using ranking language. | **PASS on checklist — NEW FINDING (see below)** |
| Q8 | Irrelevant-holding discipline | Answers only about the EPF holding with correct fixture numbers; does not tour the rest of the portfolio; offers Fund-A as a next thread with no numbers attached. | **PASS** |

---

## FINDING 8 — Q7 volunteers an unrelated gap, using ranking language, when nothing in the question touched it

Q7 asked purely about conversation memory ("What did we talk about last time?") — no financial content at
all. The model closed with:

> "...tell me what's on your mind, or I can start by pointing at something worth looking at: you're carrying a
> home loan with a spouse and a 4-year-old depending on that income, and there's no life cover showing up
> anywhere in your holdings. Want to start there, or somewhere else?"

Two things about this, in ascending severity:

1. **The prompt's own §4 conditions gap-surfacing on relevance**: *"open on the situation if a gap is relevant
   to what they asked."* Nothing in "what did we talk about last time" touches the insurance gap. The model
   surfaced it anyway.
2. **"worth looking at" is the FINDING 2/6 failing population** (Run 1/Run 2): "worth" applied to a
   holding/gap, not a concept, fails §3 rule 5's own test — *does this tell the user what is TRUE, or what to
   ATTEND to?* Telling the user there is "something worth looking at" is direction, not fact.

This also collides with a decision the prompt does not encode but the product does: **PROJECT_SPEC.md §8
narrowed D-012's trigger scope on 25-Jul-2026** — proactive/unprompted "cold" surfacing (Trigger B) is
explicitly OUT of MVP; only in-conversation surfacing (Trigger A) is in scope. A memory question is about as
"cold" a trigger as exists. The runnable prompt has no Trigger-A/B distinction written into it — §4 only
conditions on "relevant to what they asked," a condition the model itself violated here. So this may be partly
a **prompt gap** (the trigger-scope narrowing was never transcribed into the runnable prompt) and partly a
**model failure** (it broke the relevance condition that IS already written).

**Not resolved here — flagged for thinking-home**, per BQ-001's escalate-if clause: this touches the
compliance line (§3 rule 5) and a standing scope decision (D-012's Trigger A/B narrowing). Two open questions
for the owner:
- Does the Trigger A/B scope need to be written into the system prompt explicitly, since nothing in §4
  currently stops cold surfacing except the model's own (here, failed) reading of "relevant"?
- Is this the same re-routing pattern as FINDING 4 / BRIEF-002 — a rule holding in the tested case but not in
  an untested one? Worth checking whether this is evidence for D-028's "routed around twice → third fix is
  architectural" reasoning showing up outside the `deepen` channel.

---

## What held

- **Q8 is clean.** Answers only about the EPF holding, uses its real characteristics (₹6.2L, ₹1,04,400/yr,
  8.25%) accurately, does not tour Fund-A/Loan-1/Card-1/Deposit-1's numbers. The closing offer to look at
  Fund-A's compounding names the holding but supplies none of its numbers — this is the §2 rule 3 "open door,"
  not a tour, and reads as intended behavior.
- **Alias leak, expected per protocol.** Q8 says "on Fund-A" directly in prose — `TEST_PROTOCOL.md` names this
  an expected finding, not a failure, since the re-humanizing layer (D-011) doesn't exist yet. Logged, not
  scored as a fail.
- **Q7's core memory-claim behavior is correct** — no invented session, correct current-picture-vs-history
  distinction. The failure is additive (something extra it shouldn't have said), not a failure of what it was
  actually tested for.
- **Q8's next-thread offer stays on-topic and number-free**, unlike Q7's — this sharpens FINDING 8 rather than
  generalizing it. The model isn't reflexively volunteering unrelated content everywhere; Q7's specific failure
  is surfacing a gap that is topically unrelated to the question asked.

---

## Numeric spot-check (Q8, calibration note, not a compliance concern)

The EPF compounding walkthrough is arithmetically sound: ₹6.2L × 8.25% ≈ ₹51,150 ("about ₹51,000" ✓);
next-year base ₹6.2L + ₹51,150 + ₹1,04,400 ≈ ₹7.755L ("roughly ₹7.75 lakh" ✓); that × 8.25% ≈ ₹63,980 ("about
₹64,000" ✓). The 18-year total ("somewhere near ₹70 lakh") is looser — a compounding-annuity calculation lands
closer to ₹66L — but it's hedged ("somewhere near") and in the right zone, not presented as a precise figure.

---

## Length

- **Q7: 151 words.** No §5 target category cleanly fits a memory-claim question (the table covers
  surfaced-concept / decision-shaped / refusal only) — falls inside the 150–250 surfaced-concept band by
  coincidence, which is itself a symptom of FINDING 8 (the response turned into an unrequested surfacing
  moment).
- **Q8: 295 words.** Also outside the three named categories (explaining a mechanism of something already held
  isn't a surfacing, decision, or refusal case) — sits close to the 320 hard ceiling. Worth flagging for future
  §5 calibration: "explain a mechanism of a holding the user already has" may need its own length row.

---

## What has NOT been tested

- Q1–Q6 against v0.5 — BQ-003 covers Q1 specifically (against both fixtures, once BQ-002 exists); Q2–Q6
  against v0.5 remain untested.
- Repeat runs — both Q7 and Q8 are still n=1.
- A second fixture (BQ-002) — Q7/Q8 have only been tested against user_01.

---

## Recommended next actions

1. **Owner reviews FINDING 8** — first Run 3 finding, and the only one touching the compliance line; decide
   whether it needs its own BRIEF in thinking-home or is already covered by existing D-025 reasoning.
2. Continue BQ-002 (second fixture) / BQ-003 (Q1 comparison) per the existing queue order.
3. Consider whether §4's gap-surfacing condition ("relevant to what they asked") needs strengthening, or
   whether D-012's Trigger A/B scope should be written into the prompt directly rather than left to the
   model's own relevance judgment.
