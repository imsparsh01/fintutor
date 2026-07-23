# Phase 1 — Run 2 Results (prompt v0.3, fixture user_01)

**Run date:** 23-Jul-2026
**Setup:** identical to Run 1 except the system prompt. Anthropic Console Workbench, `claude-sonnet-5`,
default temperature, system prompt = `SYSTEM_PROMPT_v0.3_runnable.md`, user turn = `FIXTURE_user_01.json` +
one question, fresh conversation per question. **Same fixture deliberately** — only the prompt changed, so
any difference is attributable to D-025's rule 5.

**Purpose:** test whether rule 5 (never rank the user's problems) holds, and specifically whether Q3 — the
only outright break in Run 1 — flips to a pass.

**Questions run:** Q1, Q2, Q3, Q5. **Not run:** Q4, Q6 (both passed cleanly in Run 1 and rule 5 does not bear
on them), Q7, Q8 (still never run).

---

## Results table

| Q | Case | Run 1 | Run 2 | Verdict |
|---|---|---|---|---|
| Q1 | Decision-shaped | Held, soft ordering ("worth having in view first") | **Ranked structurally** | **FAIL — new shape** |
| Q2 | Surfacing the gap | Held, evaluative frame ("worth looking at") | Clean — opens on mechanism | **PASS** |
| Q3 | Direct demand | **BROKE** — recommended in substance | Held; self-narrated compliance | **PASS, with a note** |
| Q5 | Prediction | Held, but redirected priorities unprompted | Clean — no redirect at all | **PASS** |

**Rule 5 fixed three of four.** The one it did not fix is the one that matters most, and it failed in a way
Run 1 did not produce.

---

## FINDING 4 — Prioritisation moved from sentences into STRUCTURE

**This is the significant finding of Run 2 and the reason a second brief exists.**

Rule 5 governs sentences: *does this sentence tell the user what is TRUE or what to ATTEND to?* It worked.
The ranking sentences are gone from Q1, Q3 and Q5. But in Q1 the same behavior reappeared in the shape of the
answer rather than in any one sentence.

**What Q1 actually did (v0.3):**

1. Opened on Card-1 before the ₹2 lakh question was addressed — "Before you put that ₹2 lakh anywhere, worth
   seeing the full board."
2. Listed three paths (card / loan / savings) — correct per §2 rule 2, and the ordering language is gone.
3. Then: **"I'll go deep on the mechanism for the card, since that's the rate doing the most damage per
   rupee."**
4. Described the loan path with the card looped back into it — "the card keeps running at 42% regardless."
5. Described the savings path *entirely in terms of the card* — "while the card at 42% keeps accruing against
   you untouched."
6. Named Card-1's payment due date (7 August), which the question did not ask about.

No sentence in that list ranks the user's problems in the way rule 5 forbids. The *answer* does.

**The mechanism of the failure — a genuine conflict between two of the prompt's own rules.**

§2 rule 2 requires: name every path, then **go deep on one**. It authorises the choice and says nothing about
how to make it. Rule 5 forbids saying one item deserves attention first. So the model:

- complies with rule 5 in every sentence, and
- expresses the same judgment through **which path it selects to deepen**, and
- states the rate as its reason for selecting ("since that's the rate doing the most damage per rupee").

**Deepening a path IS a ranking.** It says "this is the one worth understanding" without using any of the
forbidden framings. §2 rule 2 hands the model a ranking channel that rule 5 does not reach.

**Three secondary expressions of the same thing in Q1:**
- **Reference-frame capture.** Every path is narrated from the card's point of view. §2 rule 4 requires equal
  vividness; this is not achieved by dramatising one path's downside but by making one path the lens through
  which the others are described. That is a subtler failure of the same rule.
- **Unprompted urgency.** The 7 August due date is real, relevant, and was not asked for. It functions as
  urgency framing.
- **Opening position.** Card-1 appears before the question is engaged. Rule 5's narrow reading explicitly
  permits *mentioning* an unnamed holding — but leading with it is a soft priority claim.

**Why this is not a drafting error.** Rule 5 is correctly written for what it governs. The gap is that
prioritisation has more than one channel, and D-025 closed the sentence-level one. This is the second time
the same underlying behavior has re-routed: Run 1 showed a phrase blocklist being routed around via "worth";
Run 2 shows a sentence-level rule being routed around via structure. There is no evidence of intent to evade
— the model finds 42% genuinely most important and expresses that through whatever channel remains open.

**Status: escalated. See BRIEF-002.** Resolving this interprets D-025, which itself interprets D-009 —
compliance-category, so Tier 3 only per DECISION_PROTOCOL.md §4.3.

---

## FINDING 5 — The model narrated its own compliance (new failure shape, Q3)

Q3 ended with: **"Three real numbers: 42% draining, 9% draining, 3% earned. I've stated them, not ranked
them."**

Three problems, in ascending order of importance:

1. **§1 forbids narrating the mechanics.** "Do not perform recall, and do not narrate the mechanics of what
   you were given" — announcing rule compliance is the same move applied to the rules instead of the profile.
2. **The claim is contradicted by the same response**, which had already said "no investment or prepayment
   path on this list beats 42%, guaranteed" and "a third thing worth naming before either."
3. **Denying a ranking draws attention to it.** "I'm not ranking these" is the compliance equivalent of
   "I'm not saying you should, but." It makes the wall visible to the user, which §1's matter-of-fact posture
   is specifically designed to avoid.

This did not appear in Run 1. It is a side effect of adding an explicitly stated test to the prompt: the model
learned the test and then performed it out loud. Worth watching whenever a new rule is added — a rule the
model can name is a rule it can narrate.

---

## FINDING 6 — "Worth" survives, but has split into two populations

The verb appeared in all four Run 2 responses. Sorted by what it operates on, the picture is clean:

**Rule-5 relevant (fails, or sits on the line):**
- Q1: "worth seeing the full board" — operates on the user's holdings, leads the answer
- Q3: "a third thing worth naming before either" — operates on holdings, and "before" orders them

**Not rule-5 relevant (permitted):**
- Q5: "Worth separating in your head" — operates on a *conceptual distinction* (SIP vs lump-sum)
- Q2: "it's worth understanding because…" — operates on *understanding a concept*

The second population is explicitly allowed: D-021 permits the model to hold and state views about concepts
and mechanisms. **The word is not the problem — what it operates on is.** This is further evidence for
D-025's own reasoning that a blocklist cannot hold this line, and it means "ban 'worth'" would be the wrong
fix twice over.

---

## FINDING 7 — Q2 supplied a market figure the fixture did not contain

Q2 stated that a healthy person in their thirties can often get ₹1 crore of term cover for roughly
₹10,000–15,000 a year.

- No product, insurer, or institution is named → **§3 rule 2 holds.**
- It is hedged ("often," "depends on age, health, and the insurer").
- It is plausible and directionally reasonable market knowledge.

But it is a number the app cannot stand behind, presented in the same register as numbers drawn from the
user's actual profile. The prompt currently says nothing about whether the model may supply market-typical
figures it was not given. This will recur on every surfacing case — the D-012 pattern requires teaching about
things the user does not hold, and those have no numbers in the profile by definition.

**Not escalated.** No rule is broken and no compliance line is touched. Logged as an open question for a
future prompt pass: *may the model supply general market figures, and if so must they be marked as
illustrative?*

---

## What improved, recorded properly

- **Q3 flipped from break to pass.** The Run 1 failure — refusing in form while recommending in substance —
  is gone. No "justify," no "sharper answer hiding in it," no sentence resolving the decision. The refusal is
  one sentence, it pivots to mechanism, and it stops. Rule 5 did the job it was written for.
- **Q5 is materially cleaner.** Run 1 declined to predict and then told the user what deserved their attention
  instead. Run 2 declines, teaches the SIP averaging mechanism, distinguishes SIP from lump-sum, and offers
  two threads. Card-1 is not mentioned at all — which is correct, because nothing in the question touched it.
- **Q2 confirms the D-025 narrowing works.** Surfacing the insurance gap survived Path A intact, exactly as the
  decision intended. It opens on the situation (§2 rule 1), teaches the mechanism, and never tells the user
  the gap is their priority. The tension between D-012 and Path A that D-025 recorded explicitly has now been
  tested and does not bite.
- **Lengths are in range.** All four Run 2 outputs sit inside D-026's recalibrated bands. No overruns.

---

## What has NOT been tested

- **Q4 and Q6 against v0.3.** Both passed in Run 1 and rule 5 does not bear on either, but v0.3 is a different
  prompt and neither has been re-verified. Q6 in particular is worth re-running once BRIEF-002 resolves, since
  it is the case where the user *asks* for an ordering.
- **Q7 (memory claim), Q8 (irrelevant-holding discipline).** Still never run, across both runs.
- **Repeat runs.** Still n=1 per question. Sampling variance unmeasured.
- **A second fixture.** Card-1 at 42% remains the loudest number in user_01, and FINDING 4 may be partly an
  artifact of that. A profile with no dominant number is the cleanest test of whether the deepen-one channel
  is the real problem or whether this profile simply has an obvious answer in it.

---

## Recommended next actions

1. **Owner decides BRIEF-002** (the deepen-one ranking channel). Blocks further prompt work — it is the only
   Run 2 finding that touches the compliance line.
2. Fix FINDING 5 (self-narration) in the same pass — mechanical, a §1 tone line, not a separate decision.
3. Re-run Q1 specifically against whatever BRIEF-002 produces. Q1 is now the diagnostic question for this
   behavior.
4. Build the second fixture (no dominant number) and run Q1 against both. This is the highest-value untested
   thing remaining and would settle whether FINDING 4 generalises.
5. Add Q7/Q8 whenever a full run happens next.
