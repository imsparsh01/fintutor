# D-151 — Goal progress converts holding values to paise with round-half-up

**Tier:** 3, owner-decided money logic

**Completes:** D-150 currency-precision semantics

**Date:** 24-Aug-2026

## Decision

Before D-150 allocates a recognized live holding value across goals, convert that value to two decimal places
using Decimal `ROUND_HALF_UP`. For example, ₹100.005 becomes ₹100.01. Persisted goal earmarks are already
limited to two decimals. Allocation then operates in integer paise and uses D-150's largest-fractional-remainder
rule, with stable goal UUID as the tie-breaker.

Unsupported product types and missing, invalid, non-finite or negative recognized fields remain unknown rather
than zero. As D-150 already requires, every goal linked to such a contribution reports its measured known total
as partial and exposes the reason.

## Why

The stored JSON holding value can contain more precision than a displayed currency amount. An explicit rule
prevents platform-dependent binary rounding and makes the proportional cap reproducible. Half-up matches the
user-facing expectation for a rupee value exactly halfway between two paise amounts.

## Build boundary

Use Decimal parsing and integer-paise allocation throughout. Do not change Consolidated's separate historical
rounding contract as a side effect. Formula or rounding changes require another Tier-3 decision.
