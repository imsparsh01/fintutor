# D-170 — Scenario safety, eligibility, provenance and release package approved

- **Tier:** 3 — owner-decided money logic, advice boundary, financial-data handling, privacy and tax/release controls.
- **Owner instruction:** “Approved complete package.”
- **Date:** 29-Aug-2026

## Decision

The owner approved the complete recommended Scenario package presented after the BQ-132 team audit:

| Brief | Binding outcome |
|---|---|
| O-SC-1 | Use **Idle cash over time**; do not use “Inaction tax.” |
| O-SC-4 | Use formula-specific declared numeric domains and reject every unsafe input, intermediate and output before render. Exact ceilings were not included in the approved package and remain the sole open BQ-132 detail. |
| O-SC-5 | S-03 requires additional SIP greater than zero. |
| O-SC-6 | S-02 supports positive-rate loans only; zero-rate loans are outside this explorer. |
| O-SC-7 | S-06 accepts positive integer remaining months and home/personal loans only; credit-card debt stays in its dedicated payoff calculator. |
| O-SC-8 | Prototype uses honest limited evidence: record/version where available plus retrieval time and “Freshness unavailable”; no timestamp schema. |
| O-SC-9A | Production reconciliation moves S-02 inputs to an authenticated POST body. |
| O-SC-9B | Production reconciliation adds backend-authoritative ESOP record/version/source/retrieval evidence using existing metadata. |
| O-SC-9C | Production reconciliation adds backend-enumerated component IDs/versions/source/retrieval evidence for budget/corpus aggregates without timestamp schema. |
| O-SC-10 | ESOP uses the backend India-date convention for “today,” rejects future grants, labels FMV as recorded rather than current, and creates no termination countdown without termination data. |
| O-SC-11 | EX-80C remains fixture/internal-only. Non-fixture/external use requires a named financial year, official primary sources, verified date, accountable reviewer, stale shutdown and counsel gate. |
| O-SC-12 | Every recorded candidate starts offered but excluded; the user deliberately includes it before Run. |
| O-SC-13 | Accept strict whole-string plain, valid Indian-grouped and valid international-grouped numbers; show the normalized value; reject ambiguous/mixed/partial/non-finite/junk input. |

D-167, D-168 and D-169 remain binding for taxonomy/discovery, changed-input removal and conditional confirmed
Arya teaching handoff.

## Delivery boundary

- BQ-133 may implement only the approved controlled-fixture behavior after O-SC-4's exact table is approved.
- O-SC-9A/B/C are later production reconciliation obligations, not prototype network/API work.
- EX-80C and EX-TERM external-release gates remain unchanged.
- No approval here authorises production schema, API, persistence or formula mutation outside separately bounded items.

## Remaining exact-domain dependency

“Formula-specific sensible limits” selects the policy but not the actual amounts, rates, periods or output
ceilings. Those values are money-reliance boundaries and cannot be backfilled as if they were part of the
owner's approval. BQ-132 remains blocked only until that table is explicitly approved.
