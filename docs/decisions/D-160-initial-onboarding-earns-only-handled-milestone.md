# D-160 — Initial Onboarding earns only the handled milestone

- **Tier:** 3, owner-decided progression meaning after event data exists.
- **Date:** 29-Aug-2026
- **Resolves:** O-ONB-2 in the D-158 Onboarding workstream.
- **Interprets:** D-117/D-118/D-121 disclosure-equivalence for the five v2 setup prompts.

## Decision

The owner selected **Path B**. Initial Onboarding v2 emits only the once-per-version
`onboarding_handled` milestone, whether the user answers, individually skips, mixes the two, or chooses global
exit. The five setup questions do not emit `context_prompt_handled` progression events.

`context_prompt_handled` remains available for later optional context prompts outside initial onboarding,
where a prompt is independently encountered and answer/skip/defer remain equivalent. No event contains an
answer value.

## Why

Every initial setup path now has the same total progression treatment. This is simpler to explain and removes
practical pressure to step through optional questions merely to earn more progress.

## Boundaries

- No change to the 40-point onboarding-handled milestone, once-per-version rule or Discovering start.
- No progress derives from disclosure amount, completeness, sensitivity or selected answer.
- Existing internal event treatment and any migration/prospective ruleset mechanics require a separately
  bounded production build after prototype validation; no production ledger is changed here.
- Prototype realization is BQ-123 and must show the same single event for complete, skip and global-exit paths.

## Reversibility

High in the fixture. Retuning live event treatment is low-reversibility and therefore remains a separately
reviewed implementation obligation.

## Disposition

READY → BQ-123 controlled-fixture realization and validation.
