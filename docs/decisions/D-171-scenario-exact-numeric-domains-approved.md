# D-171 — Exact Scenario numeric domains approved

- **Tier:** 3 — owner-decided money-calculation reliance boundary; completes D-170/O-SC-4.
- **Owner instruction:** “approved.”
- **Date:** 29-Aug-2026

## Decision

The owner approved the exact O-SC-4 table proposed after D-170:

| Entry | Amount domain | Annual rate | Period domain | Output ceiling |
|---|---|---|---|---|
| S-03 Increase SIP | current SIP ₹0..₹1B/month; additional SIP >₹0..₹1B/month | 0..100% | 1 month..60 years; rounded months 1..720 | every monetary output ≤₹1 quadrillion |
| S-07 Idle cash | cash >₹0..₹1T | each rate 0..100% | >0..60 years | each path/difference magnitude ≤₹1 quadrillion |
| S-01 Time to corpus | corpus/contribution ₹0..₹1T; target >₹0..₹1 quadrillion | 0..100% | maximum 720 monthly iterations | every balance ≤₹1 quadrillion |
| S-06 Debt cost | outstanding >₹0..₹1T | 0..100% | integer 1..600 months | EMI/payable/interest magnitudes ≤₹1 quadrillion |
| S-02 Loan prepayment | principal/EMI/prepayment >₹0..₹1T and `X<P` | >0..100% | implied original/new tenure >0..600 months | EMI/savings magnitudes ≤₹1 quadrillion |

`₹1B = ₹1,000,000,000`, `₹1T = ₹1,000,000,000,000`, and `₹1 quadrillion =
₹1,000,000,000,000,000`. Every raw input, intermediate and output must be finite. A formula-specific lower
stability bound may reject earlier but never expand the approved domain. Rejection renders no result,
announcement, handoff or progression event. These are supported guardrails, not normal, recommended or
forecast values.

## Delivery

This closes the final BQ-132 dependency. BQ-133 implements the controlled-fixture behavior; later separately
bounded production reconciliation implements runtime formula guards and tests.
