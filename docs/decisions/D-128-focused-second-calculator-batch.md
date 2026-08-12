# D-128 — MVP adds a focused five-calculator second batch

**Date:** 12-Aug-2026  
**Tier:** 3 — owner-decided MVP scope and money-calculation boundary.  
**Interprets:** D-104/D-105's broader calculator catalogue.

## Decision

The completed MVP calculator set consists of the five already-shipped calculators, the existing
loan-versus-invest experience, and a focused second batch:

1. credit-card payoff;
2. emergency-fund coverage;
3. compound growth;
4. goal affordability; and
5. term-insurance coverage.

This replaces “implement the entire proposed catalogue for MVP” with a bounded set selected for common
customer questions and integration with FinTutor's teaching experience. The remaining proposed calculators
are not implied MVP commitments and require later evidence or separate decisions.

Income-tax comparison and HRA remain blocked. They may not ship until a separate owner decision defines the
supported financial year, rule-source and verification process, update responsibility, stale-calculation
behavior, and required legal review.

## Formula boundary

This decision approves the five capabilities, not unspecified formulas or app-chosen financial assumptions.
Each calculator requires a separately documented input, formula, disclosure, and edge-case contract before
implementation. Material rates, time horizons, contribution amounts, expense estimates, payoff payments, and
insurance assumptions must be user-supplied or explicitly owner-approved; implementation may not silently
invent defaults that users could treat as guidance.

Every result must explain the mechanism and decline a recommendation. It may compare user-selected paths or
show what follows mathematically from supplied inputs; it may not choose a target, product, security, payment,
coverage level, or financial action for the user.

## Why

The focused batch covers debt, resilience, growth, goals, and protection without turning FinTutor into an
unbounded calculator catalogue. It creates useful breadth while keeping formula review, testing, and ongoing
maintenance tractable.

## Boundaries

- No tax/HRA calculator under this decision.
- No XIRR transaction-history schema, rent-versus-buy schema, or additional calculator catalogue.
- No product/security names, benchmark returns, recommended rates, or auto-selected financial targets.
- No formula is buildable until its contract is approved and logged.

