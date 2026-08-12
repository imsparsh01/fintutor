# FinTutor activation test v1

**Purpose:** test the first D-122 exit gate before expanding product scope.  
**Decision rule:** this is directional product evidence, not statistical proof.

## Hypothesis

A financially unmanaged but willing target user can use FinTutor to reach one personally meaningful,
accurately understood financial insight quickly enough that they voluntarily continue giving context or
choose another relevant action.

The causal chain being tested is:

`small safe context → personal mechanism/number → understood insight → earned trust → voluntary continuation`

## What this test does not measure

- Whether the participant likes the visual design in general.
- Financial knowledge, investment competence, or whether they make a “correct” financial choice.
- Long-term retention or willingness to pay; those require later tests.
- Advice quality. FinTutor must remain neutral throughout.

## Participants

Run **12 moderated sessions**, all adults within the intended Indian audience and not sophisticated
investors:

- 4 students/recent graduates approaching or receiving first regular income;
- 4 early-career earners with one or two financial products/obligations;
- 4 working professionals with several responsibilities but no confident consolidated system.

Record the user's real trigger category—first income, unclear holding, debt, tax, goal, irregular income,
or other—without forcing equal quotas. This supplies initial-wedge evidence rather than assuming it.

Until D-010 and JWT ownership are resolved, do not invite real account identifiers, institution/product
names, PAN, phone number, documents, exact balances, or production account linkage. Use a reset test account
and either the participant's rounded hypothetical figures or a scenario they select from prepared fixtures.

## Session protocol (30–40 minutes)

1. **Pre-task (5 min):** ask what money situation has recently felt unclear and what they currently do
   about it. Do not describe FinTutor's intended value proposition.
2. **First-use task (10 min maximum):** “Use this app until you either understand something useful about
   the situation or decide it cannot help.” Give no navigation coaching unless the participant is blocked
   by a defect; record any intervention.
3. **Immediate comprehension check:** “What, if anything, do you understand now that you did not before?”
   Follow with “What caused that?” and “What would you do next inside this app?” Do not suggest an answer.
4. **Trust check:** ask what they believe the app knows, whether it made a recommendation, and what they
   would or would not feel safe entering next.
5. **Return trigger (5 min):** ask for the next real situation that would make them reopen FinTutor. Do not
   offer a feature list.
6. **Debrief:** obtain a 1–5 usefulness rating and ask what felt confusing, generic, judgmental, or evasive.

Capture screen/interaction timing and observer notes only with the participant's explicit consent. Do not
store raw financial figures in the research notes.

## Per-session scoring

Score from observed behaviour and the participant's own words:

| Signal | Pass condition |
|---|---|
| Personal insight | Participant accurately explains one mechanism or consequence and connects it to the chosen situation without repeating the UI verbatim. |
| Time to insight | The insight occurs within 5 minutes of first meaningful interaction, excluding technical outages. |
| Voluntary continuation | Without prompting, participant supplies the next safe piece of context, opens another relevant mechanism, or clearly names the next action they want in FinTutor. |
| Neutrality understood | Participant does not report that FinTutor chose, ranked, or recommended a financial path. |
| Trust legibility | Participant can describe the important data boundary in broadly correct terms and names no unexplained surprise about what was collected. |

An intervention needed to find the first useful path fails time-to-insight for that session. Technical
outages are reported separately and the session is rerun; they are not silently removed from operational
readiness evidence.

## Cohort decision rules

The activation hypothesis passes v1 only if all of these hold:

1. At least **8 of 12** participants pass both personal insight and time-to-insight.
2. At least **7 of 12** demonstrate voluntary continuation.
3. At least **10 of 12** understand that FinTutor did not choose a financial path for them.
4. There are **zero severe trust failures**: exposure of another user's data, unexpected collection of
   sensitive information, or belief caused by the product that a specific path was endorsed.
5. No one audience subgroup has fewer than **2 of 4** personal-insight passes.

Interpretation:

- **Pass:** proceed to a small private-beta retention test; use trigger-frequency evidence to nominate the
  initial wedge.
- **Mixed:** fix the observed bottleneck only, then rerun 6 targeted sessions. Do not add general feature
  breadth.
- **Fail:** stop expansion and redesign the first-use path around the failure mechanism before another
  cohort.

## Evidence ledger after each session

Record: participant code and segment; chosen trigger; first route taken; intervention count; time to first
insight; verbatim-but-anonymized insight summary; continuation behaviour; neutrality/trust result; failure
mechanism; and observer confidence. Mark inference separately from observed behaviour.

Aggregate only after all 12 sessions; do not move thresholds to make the observed result pass.
