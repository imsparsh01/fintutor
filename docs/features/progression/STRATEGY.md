# Financial learning progression — executive strategy register

**Priority:** Top-level product strategy; resolve before implementation or lower-priority feature expansion.
**Status:** Direction confirmed in D-114; five-stage journey confirmed in D-116; event rules confirmed in
D-117; build blocked pending the remaining sub-decisions below.
**Working label only:** “financial learning progression” is an internal description, not a decided user-facing name.

## Product promise

FinTutor makes two things increasingly visible over time: what the user understands, and how much
financial context they have voluntarily given Arya. It does **not** turn changes in wealth, Portfolio
Health, savings, investing, insurance, debt, or tax utilisation into game progress.

The primary promise is **“I understand more.”** The supporting promise is **“FinTutor understands my
financial context better.”** A higher app level never claims that the user’s finances improved.

## Target audience

- Students beginning to understand money.
- Recent graduates and early-career earners.
- Working professionals with up to roughly ten years of experience.
- Approximately ages 18–32 as a product-design and marketing audience, not an access gate.
- Experienced/sophisticated investors are not the target segment.

## Four separate systems

1. **Starting context (internal):** earning context, responsibility, exposure, familiarity, and immediate intent.
2. **Learning progression (visible):** levels plus continuous progress earned from meaningful app behavior.
3. **Financial-picture coverage (visible, neutral):** context the user has voluntarily provided; never rank.
4. **Portfolio Health / financial change (visible, factual):** never XP, level, streak, reward, or celebration input.

## Confirmed progression inputs

Completing onboarding; exploring a teaching moment; meaningfully using a calculator or scenario; having a
substantive Arya conversation; revisiting an explanation; voluntarily adding or confirming context;
returning on another day; and exploring a previously unused capability. Repetition, empty messages, and
add-delete loops must not farm progress.

## Confirmed outputs and rewards

Levels plus continuous progress may change visual identity, cosmetic profile markers, celebrations,
recap presentation, default explanation depth, and optional challenges. Educational facts, visual
celebrations, streak acknowledgements, recap cards, and cosmetic markers are permitted rewards. Content
is never locked, and explanation depth always remains user-overridable.

## Measurement hierarchy

- **North star:** meaningful learning sessions per retained user.
- **Primary:** onboarding completion, first meaningful session, D7/D30 retention, meaningful-session rate,
  feature breadth, and voluntary financial-picture coverage.
- **Business:** eventual paid conversion.
- **Guardrails:** disclosure pressure, onboarding abandonment, activity farming, perceived judgment, and
  engagement without meaningful learning.

## Remaining executive decisions — resolve in order

1. ~~Level architecture and user-facing naming.~~ **Resolved — D-116.**
2. ~~Progress-event definitions, weights, caps, and anti-farming rules.~~ **Resolved — D-117.**
3. ~~Exact onboarding question flow and migration from the current four-track model.~~ **Resolved —
   D-118/D-119.** Five-question flow, normalized-only persistence, 18+ eligibility, authoritative
   completion, and grandfathered non-inference migration are approved.
4. Placement of level, progress, recap, and profile-coverage surfaces.
5. Instrumentation, privacy/consent, and the definition of a meaningful learning session.
6. Paid-tier boundary; “eventual paid conversion” is a metric, not yet a monetisation decision.

No implementation starts until at least items 1–3 are decided and logged.
