# D-117 — Learning progression event rules v1

**Date:** 12-Aug-2026  
**Tier:** 2 — REVIEW-FLAGGED; bounded and reversible before implementation, but it shapes product
incentives and operationalises D-116.  
**Status:** Decided under D-034 autonomy; owner may veto or retune before build.

## Decision

Adopt `EVENT_RULESET_v1.md` as the first exact progression ruleset. It assigns progress only to
verifiable learning and exploration behaviors; adds per-event and 60-point repeatable daily caps;
requires both breadth and meaningful return days for stage advancement; and defines an open-ended
Expanding milestone every additional 250 points.

The stage floors are 100 / 300 / 650 / 1,100 points for Exploring / Connecting / Deepening / Expanding,
with 2 / 3 / 4 / 4 active dimensions and 2 / 5 / 12 / 25 meaningful return days respectively.

Profile-context prompts award the same progress for answer, confirmation, defer, or skip. The amount,
completeness, sensitivity, and financial value of disclosed information never affect progress.

## Why

The strategy needed rules concrete enough to test before architecture is chosen. Pure activity points
would be easy to farm and would reward app time rather than learning. Requiring a valid completion,
limiting repeated events, and combining points with breadth and return-day gates preserves momentum
without claiming that the user has mastered finance.

The rules avoid an LLM quality classifier in v1. Such a classifier would add cost, opacity, inconsistent
rewards, and a new architectural dependency before evidence shows it is needed.

## Decision lenses

- **Compliance — PASS:** no financial result, balance, contribution, product, security, or real-world
  action changes progression; the system makes no advice or mastery claim.
- **Product — PASS WITH WATCHPOINT:** the model rewards useful breadth and return behavior while remaining
  legible. Exact pacing is hypothetical until simulation and user evidence, so constants remain tunable
  before launch.
- **Technical — PASS:** every qualifying event has a deterministic completion condition and cap. Durable
  event storage, day boundaries, and migration are deliberately not authorised by this decision.
- **Cost/scope — PASS:** this uses capabilities already in the product direction and introduces no
  service, dependency, paid feature, or new content surface.

## Boundaries

- This decision does not authorise implementation, analytics collection, a database schema, or migration.
- Exact onboarding flow/migration remains the next blocker.
- Instrumentation, privacy/consent, retention/deletion, timezone semantics, and retroactive recalculation
  after users exist remain Tier-3 decisions.
- No content gates, paid-tier boundary, or financial-outcome reward is introduced.

## Review flag

The owner should review the incentive shape and may veto or retune it before implementation. Work may
continue to the next strategy blocker without waiting because the rules are isolated and reversible.
