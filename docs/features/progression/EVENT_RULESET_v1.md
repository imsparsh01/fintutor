# Learning progression event rules — v1

**Status:** Product rules confirmed by D-117; implementation remains blocked on onboarding and the
instrumentation/privacy package.
**Ruleset version:** 1

## What the number means

Progress is evidence that a user has meaningfully explored more of FinTutor, across more kinds of
learning activity and over time. It is not a measure of financial success, financial knowledge,
intelligence, wealth, discipline, or product loyalty. The app may show a progress percentage and explain
which action moved it; the internal point values do not need to be presented as a game currency.

## Eligible events

| Event | Dimension | Points | Eligibility and repeat limit |
|---|---:|---:|---|
| Onboarding completed | Milestone | 40 | Once for the applicable onboarding version. Onboarding alone cannot satisfy a breadth requirement. |
| Capability first used | Explore | 15 | Once per capability family: teaching, calculator, scenario, Arya, and recap. May accompany the qualifying completion event. |
| Teaching moment explored | Explore | 10 | Once per distinct teaching subject. Opening and immediately leaving does not qualify. |
| Teaching moment revisited | Reflect | 5 | Same subject, at least 7 calendar days after its first qualifying exploration; at most one revisit award per day. |
| Calculator completed | Model | 12 | A valid result is produced; at most once per calculator type per day and twice across calculators per day. |
| Scenario completed | Model | 15 | A valid result is produced; at most once per scenario type per day and twice across scenarios per day. |
| Arya exchange completed | Reflect | 8 | A non-empty user question receives a successful response; at most three awards per day. No subjective LLM quality grader in v1. |
| Recap completed | Reflect | 8 | One award in any rolling seven-day period. Merely opening the recap does not qualify. |
| Context prompt handled | Reflect | 5 | Once per prompt/version. Answer, confirm, defer, and skip earn the same amount; disclosure never earns more progress. |
| Meaningful return day | Return | 10 | Once per day after at least one eligible Explore, Model, or Reflect event. Opening the app alone does not qualify. |

An optional challenge never creates a second award. The underlying eligible action earns its normal
progress. Current streak behavior remains separate and does not itself add progress.

## Caps and anti-farming

- Repeatable events contribute at most **60 points per day**. One-time onboarding and first-capability
  milestones sit outside that cap because they cannot be farmed.
- Identical payloads, retries, refreshes, back-navigation, and add-delete cycles do not create new events.
- Calculator and scenario awards require a successfully rendered result, not merely a screen visit.
- Failed or empty Arya exchanges do not qualify. Rewording repeated prompts may still qualify within the
  three-per-day cap; v1 deliberately avoids opaque semantic policing.
- Context disclosure is never rewarded by amount, completeness, financial value, or sensitivity. Skipping
  receives the same event credit as answering.
- Progress never decreases. Corrections suppress a duplicate before award; they do not claw back visible
  progress from a user.

## Stages and advancement

Stage advancement requires all three columns below. A dimension is active once it has at least one
eligible event; this keeps the model understandable while the daily cap prevents one behavior from
creating unlimited progress.

| Stage reached | Lifetime points | Active dimensions | Meaningful return days |
|---|---:|---:|---:|
| Discovering | 0 | 0 | 0 |
| Exploring | 100 | 2 of 4 | 2 |
| Connecting | 300 | 3 of 4 | 5 |
| Deepening | 650 | 4 of 4 | 12 |
| Expanding | 1,100 | 4 of 4 | 25 |

The product should explain an unmet breadth or return-day condition directly instead of leaving a bar at
an unexplained ceiling. No content or capability is locked behind a stage.

Expanding is open-ended. Lifetime progress continues to rise, and each additional 250 points may trigger
an **Expanding milestone** celebration or cosmetic marker. This is not a sixth rank. The lifetime total
must remain visible so a milestone-cycle indicator never appears to erase progress.

## Meaningful learning session — measurement definition

For product measurement, a meaningful learning session is a 30-minute activity window containing at
least one eligible Explore, Model, or Reflect event. Additional eligible activity within 30 minutes stays
in that session; eligible activity after 30 minutes begins another. App opens, passive dwell time, and the
Return award alone are not meaningful sessions.

This is the product definition only. Event storage, timestamps, timezone/day boundaries, consent,
retention, deletion, analytics vendors, and historical migration remain part of the later Tier-3
instrumentation/privacy decision. Until that package is approved, these rules authorise no new telemetry
or durable schema.

## Tuning rule

The values above are a pre-launch v1 baseline, not claims about users. Before external launch, QA should
simulate light and frequent usage paths and check that no single feature can dominate progression.
Changing earned progress retrospectively after real users exist is not authorised here and requires a
separate decision.
