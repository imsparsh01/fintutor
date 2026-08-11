# D-118 — Five-axis onboarding assessment product contract

**Date:** 12-Aug-2026  
**Tier:** 2 — REVIEW-FLAGGED; implements D-114’s owner-delegated onboarding direction and replaces D-084’s
four-track product flow while preserving its conversational, ungated, fail-safe principles.  
**Status:** Decided; implementation blocked on the Tier-3 persistence/privacy package.

## Decision

Adopt `ASSESSMENT_V2.md`: five optional conversational questions covering immediate intent, earning
context, financial responsibility context, generic prior exposure, and self-reported familiarity.

The initial assessment requests no amounts, names, dates, holdings, institutions, or financial history.
It creates no public persona, financial-health label, knowledge rank, or starting-stage advantage. Every
user starts at Discovering. Answers adjust initial navigation and explanation presentation only.

The flow is handled after answers/skips for all five prompts or a global exit. All paths receive identical
setup progress treatment. This changes D-117’s event label from “Onboarding completed” to “Onboarding
handled” so disclosure is never the practical price of progress; the weight and one-per-version rule stay.

Existing users are grandfathered and never forced through v2. No v2 answer is inferred from a legacy
track or financial record. Optional reassessment may be offered later.

## Why

The old four tracks compress life stage, product exposure, and familiarity into one persona and do not fit
the broader D-114 audience. Independent, self-reported axes produce more honest personalization while
remaining short and non-judgmental. Starting with immediate intent gives the user a visible reason for the
questions before asking context.

Deterministic chip transitions remove unnecessary LLM classification for the normal path. Typed answers
remain optional and must degrade safely without trapping the user.

## Decision lenses

- **Compliance — PASS WITH BLOCKER:** question content is broad and non-financial; persistence, provider
  transmission, eligibility, consent, retention/deletion, and populated migration still require Tier 3.
- **Product — PASS:** five questions cover D-114’s axes without a quiz, age question, or forced disclosure.
- **Technical — PASS WITH BLOCKER:** the current state machine and escape mechanics are reusable, but its
  schema cannot represent five axes honestly.
- **Cost/scope — PASS:** this replaces the already-committed onboarding flow and adds no MVP capability.

## Supersession boundary

D-084’s four named tracks and track-specific stage map are superseded for new-user onboarding. D-082’s
structured conversation, onboarding-only scope, clear-next-step requirement, and universal exit survive.
D-083’s “small structured state, not stored transcript” principle also survives; the exact replacement
state awaits owner approval.
