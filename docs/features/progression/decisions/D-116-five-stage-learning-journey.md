# D-116 — Five-stage learning journey adopted

**Tier:** 3, owner-decided directly in conversation
**Implements:** D-114’s levels-plus-continuous-progress direction
**Date:** 12-Aug-2026

## Decision

FinTutor will use one visible five-stage learning journey:

**Discovering → Exploring → Connecting → Deepening → Expanding**

The user sees their current named stage, continuous progress toward the next stage, a plain explanation of
what moved progress, and optional ways to continue. The five names are approved working product names; UI
microcopy and visual treatment may be refined without reopening the architecture.

A stage means only:

> You have meaningfully explored more of FinTutor, across more kinds of learning activity and over time.

It does not certify knowledge, intelligence, readiness, investment ability, financial health, or real-world
success. “Beginner,” “Intermediate,” “Advanced,” “Expert,” “Master,” “Investor,” and wealth/fitness rank
language are not permitted substitutes.

## Internal progression dimensions

One visible journey is backed by breadth across four internal behavior dimensions—not four public scores:

1. **Explore** — teaching moments and first use of a capability.
2. **Model** — calculators and scenarios completed through a valid result.
3. **Reflect** — substantive Arya exchanges, revisits, and recaps.
4. **Return** — meaningful activity on another day.

Later stages require diverse activity across dimensions, not merely a point threshold. Exact event weights,
caps, and breadth requirements remain lower-level design work under this architecture.

## Binding guardrails

- Progress and stage never decrease; streak reset remains separate.
- No teaching content, tool, or feature is level-gated.
- No financial value, outcome, Portfolio Health result, product choice, or real-world action affects progress.
- Calculator/scenario progress is identical regardless of result.
- Financial disclosure is never required for progress; handling a context prompt includes deferring/skipping.
- Challenges ask users to explore, compare, model, or reflect—never to take a financial action.
- Stage is not the primary explanation-depth control. User preference and onboarding familiarity come first,
  and simpler/deeper remains immediately available.
- Progress attribution is transparent rather than only an opaque XP award.
- Payment cannot buy progress, preserve streaks, or confer expertise-signalling status.

## Technical direction carried by the decision

The eventual implementation must be backend-authoritative and versioned. A behavior-event ledger plus a
rebuildable progress summary is the preferred architecture; progression must not be implemented as frontend
counters or bolted onto `streak_states`. Durable schema, privacy/retention, authentication, and migration
remain a later Tier-3 package after event rules are drafted.

## Why

Journey language creates identity and visible advancement without making an unsupported competence claim.
Five stages are enough to create meaningful milestones without an endless level-inflation system, and the
open-ended final stage avoids declaring the user finished learning.

## Reversibility

High while unbuilt. Once users accumulate progression history, changing stage semantics or thresholds may
become low-reversibility and must be migrated deliberately.
