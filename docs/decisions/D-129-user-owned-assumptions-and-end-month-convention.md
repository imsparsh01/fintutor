# D-129 — Users own consequential calculator assumptions; recurring contributions use month-end timing

**Date:** 12-Aug-2026  
**Tier:** 3 — owner-decided money-calculation convention and cross-calculator rule.  
**Applies to:** existing and D-128 calculator contracts where relevant.

## Decision

FinTutor never supplies a consequential financial assumption that drives a user-facing result. Users enter
rates, targets, horizons, payments, contribution changes, and other future-world choices. Stored-data
prefills may be offered only when visibly attributed, fully editable, and already authorised by the relevant
data contract. FinTutor does not insert “typical,” recommended, or silently assumed values.

FinTutor may choose a standard mathematical convention when a calculation requires one, provided that the
convention is disclosed beside the result, applied consistently, and the output is described as a conditional
model rather than a forecast or recommendation.

For monthly recurring contributions:

- contributions are modeled at the end of each month;
- each contribution begins compounding in the following monthly period; and
- an annual step-up begins with the first contribution of each new 12-month block.

This convention applies consistently to SIP Goal Planner, Step-up SIP, Compound Growth, and any later
approved recurring-contribution formula unless a separate decision expressly states otherwise.

## Why

The user should control the uncertain financial inputs; the app should own only transparent arithmetic.
Month-end timing is a simple, consistent, slightly conservative convention that avoids giving results a
hidden favorable timing benefit or adding a technical question most users cannot answer meaningfully.

## Required presentation

- State the relevant compounding and contribution timing beside each result.
- Explain exclusions that can materially cause real outcomes to differ.
- Never call a modeled result expected, likely, safe, adequate, affordable, or recommended.
- Use neutral figure styling and mechanism copy under P2/P10/D-091.

## Boundaries

- No app-selected return, inflation, income-growth, payoff-payment, insurance-multiple, or emergency-month target.
- No tax, fees, volatility, rate changes, missed contributions, or institution-specific rounding unless the
  individual calculator contract expressly includes them.
- This decision does not approve calculators outside D-128's focused batch.

