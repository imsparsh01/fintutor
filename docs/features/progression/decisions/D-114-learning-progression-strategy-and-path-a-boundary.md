# D-114 — Learning progression strategy adopted; real financial change is never game progress

**Tier:** 3, owner-decided directly in conversation
**Supersedes:** D-053/D-054’s narrower early-career-only founding segment as product direction;
the corresponding `PROJECT_SPEC.md` §3 wording remains a separately confirmed edit
**Interprets and preserves:** D-060, D-061/P7, D-077/P9, D-100, D-105/D-106
**Date:** 12-Aug-2026

## Decision

FinTutor’s target audience expands to students, recent graduates/early-career earners, and working
professionals with up to roughly ten years of experience. Ages 18–32 is the intended design and marketing
range, not an access gate. Experienced or sophisticated investors are not the target.

The app will develop a visible learning-progression system with named levels plus continuous progress.
Progress may be earned from meaningful behavior: completing onboarding, exploring teaching, meaningfully
using calculators and scenarios, substantive Arya conversations, revisiting explanations, voluntarily
adding or confirming context, returning on another day, and exploring app capabilities.

The owner explicitly chose **Path A** for the critical boundary:

> Actual financial changes remain visible and factual, but never affect XP, levels, streaks, rewards,
> celebrations, or cosmetic status. Progress represents learning and meaningful participation.

Accordingly, the strategy separates starting context, learning progression, financial-picture coverage,
and Portfolio Health/financial change. These may inform one another’s explanations but never collapse into
one score.

## Onboarding direction

The owner delegated the onboarding assessment design within the confirmed strategy. It will identify five
non-judgmental axes through a short adaptive conversation: earning context, financial responsibility,
existing financial exposure, self-reported familiarity, and immediate intent. It is not a knowledge test
and does not publicly certify a user as beginner or expert. Arya may adapt vocabulary and default depth,
but users can always request simpler or deeper explanations.

## Levels, rewards, and retention

Levels may affect visual identity, cosmetic markers, celebratory feedback, recap presentation, default
explanation depth, and optional challenges. Permitted rewards include educational facts, visual
celebrations, streak acknowledgements, recap cards, and cosmetic markers. Relevant content is never
locked by level, and optional financial disclosure is never the price of progression.

Daily/weekly retention uses continuation, meaningful exploration, neutral recaps, learning progress, and
behavior-based rewards. It never assigns a financially directive task or celebrates a particular financial
outcome.

## Business measurement

The north star is meaningful learning sessions per retained user. Supporting metrics are onboarding
completion, first meaningful session, D7/D30 retention, meaningful-session frequency, feature breadth,
voluntary financial-picture coverage, and eventual paid conversion. Portfolio Health improvement is not
a progression KPI. Guardrails monitor disclosure pressure, activity farming, perceived judgment, and
engagement without learning.

## Why

This preserves the owner’s intended retention and dopamine loop while maintaining FinTutor’s existing
separation between behavioral engagement and real money. A person’s level can say they have explored and
learned more inside FinTutor; it cannot imply that they are wealthier, safer, smarter, or financially more
successful.

## Remaining decisions

This is direction, not a build-ready PRD. Level architecture/naming, event weights and anti-farming,
onboarding-flow migration, UI placement, instrumentation/privacy, and any paid-tier boundary remain open.
They are sequenced in `docs/features/progression/STRATEGY.md`. No user-facing level names are approved by
this decision.

## Reversibility

High while unbuilt. Once users hold progression history, changes to the level formula or event ledger may
become low-reversibility and must be treated accordingly.
