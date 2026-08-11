# D-112 — Both 80C calculations use strict cadence handling and recognise six-month premiums

**Tier:** 2, owner-confirmed directly in conversation (calculation users rely on)
**Supersedes in part:** D-109’s accepted frontend/backend divergence
**Date:** 12-Aug-2026

## Decision

The Portfolio Health tax-utilisation calculation and the backend “Check my 80C room” calculation
must apply the same strict cadence rule: an insurance premium counts only when its cadence is present
and explicitly recognised. Missing or unrecognised cadence is excluded; it is never silently treated
as monthly.

Both frontend and backend must also recognise an explicitly stated six-month cadence and annualise it
as two payments per year. The implementation may accept clear spelling variants, but every accepted
variant must map to the same ×2 annual conversion on both sides.

## Why

D-109 deliberately accepted a mismatch because only the Portfolio Health calculation had strict
handling at the time. The owner has now resolved that limitation in favour of consistency: the strict
rule is the safer failure mode for both figures, and a genuine six-month premium should not be dropped
merely because the existing cadence table omitted it.

## Guardrails

- No blank or unknown cadence receives a guessed conversion.
- The frontend and backend accepted-cadence sets and conversion results must be cross-checked.
- This changes calculation handling only; it does not change the 80C cap, eligibility categories, or
  tax-regime behaviour.

## Reversibility

Medium. The code change is small, but it changes a user-visible financial calculation and therefore
requires explicit regression cases before shipping.
