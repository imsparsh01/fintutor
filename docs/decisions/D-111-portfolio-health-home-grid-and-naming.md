# D-111 — Home shows a tappable Portfolio Health grid, and “Health Score” is renamed

**Tier:** 3, owner-decided directly in conversation
**Interprets:** D-105 and D-106 — changes the user-facing name and resolves BQ-060’s Home-card shape
**Date:** 12-Aug-2026

## Decision

The user-facing feature name is **Portfolio Health**, not “Health Score.” On Home it appears as an
overall score plus a 2×2 grid containing all four sub-scores: Investment rate, Insurance, Emergency
buffer, and Tax utilisation. Every sub-score is independently tappable and opens Portfolio Health with
that lever’s mechanism detail expanded.

The complete BQ-060 Home feed retains the eight-section order approved in BRIEF-019/D-104: greeting,
financial picture, Portfolio Health, Arya, calculators, scenarios, Learn, and streak/reward.

## Why

“Portfolio Health” says what the score is actually about and avoids suggesting a broad judgement about
the person’s overall financial wellbeing. Showing the sub-scores on Home makes the aggregate legible:
the user can see the four inputs and enter the exact mechanism behind any one of them rather than treating
the single number as an unexplained verdict.

## Guardrails carried forward

- The grid uses neutral ink for all figures (P10); no score receives valence colour or a good/bad label.
- A tap opens explanation and user inputs, never a recommended corrective action (P2/D-009).
- Home calculator cards launch calculators. They do not claim to show “last results,” because results are
  not persisted in the current architecture.

## Reversibility

High. Navigation parameters and presentation only; no backend, schema, or persisted-data change.
