# D-162 — Portfolio Health insurance uses transparent components, not one score

- **Tier:** 3, owner-decided financial-data/formula meaning.
- **Supersedes:** D-106 Decision 2, insurance sub-score only.
- **Date:** 29-Aug-2026

## Decision

Portfolio Health shows separate factual insurance components: health-cover presence (confirmed yes, confirmed
no, or not provided); term-cover presence (recorded or none recorded); and recorded term-cover-to-annual-income
ratio when both finite positive sources exist, otherwise unknown.

It does not combine them into one insurance-points value and does not apply D-106's 10× threshold as an
adequacy judgment. “None recorded” describes FinTutor's records, not proven real-world absence.

## Why

D-106 and shipped code disagree materially, and neither combined formula stays purely descriptive: D-106
embeds a sufficiency threshold while shipped behavior makes term-only cover worth zero. Separate components
keep the facts and their provenance visible without ranking or calling cover adequate.

## Boundaries

- No production formula or UI changes are authorised; BQ-128 validates the fixture first.
- The ratio is descriptive arithmetic only, with no target, band, colour or good/bad label.
- Missing income, cover amount or health answer remains unknown and is never inferred.
- Qualified India insurance/fintech counsel remains required before external launch under D-009/D-145.

## Reversibility

High at the definition/prototype layer. Eventual production work is separately bounded.

## Disposition

READY → BQ-128 controlled-fixture realization and BQ-129 validation. Production remains separate.
