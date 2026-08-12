# D-124 — Activation test v1 and evidence thresholds

**Date:** 12-Aug-2026  
**Tier:** 2 — REVIEW-FLAGGED; reversible pre-beta research design implementing D-122.  
**Implements:** D-122 gates 1, 2, and evidence input for gate 6.

## Decision

Adopt `docs/features/activation/ACTIVATION_TEST_V1.md`: 12 moderated target-user sessions across three
audience maturity bands, using safe rounded/hypothetical data until launch trust gates are resolved. The
primary pass threshold is 8/12 users reaching an accurately articulated personal insight within five
minutes; continuation, neutrality, trust, and subgroup floors are independent required gates.

## Lenses

- **Compliance — PASS:** the test measures understanding, not financial choices; prohibits product advice
  and real identifiers/sensitive production data before D-010/JWT resolution.
- **Product — PASS:** it directly tests D-122's causal customer-value hypothesis and treats feature requests
  as evidence rather than automatic scope.
- **Technical — PASS:** it uses the existing product and reset test accounts; no dependency, schema, or
  instrumentation is authorised.
- **Cost-and-scope — PASS WITH CONCERN:** 12 moderated sessions require owner recruitment/time, but a smaller
  sample would make subgroup failures almost invisible. The protocol remains directional, not statistical.

## Why

Activation requires both value and comprehension. A click, session length, or usefulness score alone can
rise without informed agency. The combined behavioural thresholds test whether FinTutor creates a personal
insight, whether trust is sufficient for voluntary continuation, and whether neutrality remains legible.

## Reversibility

High. Thresholds and protocol can be revised before a second cohort without touching product data or code.
They must not be changed retroactively after results are known.
