# Portfolio and Portfolio Health product requirements

## Bottom line

Portfolio is an **explainable map of recorded financial structure**, not a verdict on portfolio quality and
not a completeness checklist. Its job is to let a user see what FinTutor knows, what remains unknown or
unmeasurable, how each displayed figure was formed, and where to inspect or correct the underlying record.

The core bottleneck is trust in partial information. A polished score or chart is harmful if the user cannot
tell whether it describes rupee value, record count, coverage breadth, data completeness or performance.

## User and problem

An adult learner building a financial baseline needs to answer four practical questions:

1. What have I recorded across Investments, Loans and Insurance?
2. Which values are known, unknown, invalid or deliberately excluded?
3. What does each Portfolio Health measure actually mean and use?
4. How can I inspect, correct, learn about or add a record without being told what to buy or prioritize?

Without a trustworthy view, users either treat partial data as a complete financial picture or cannot tell
whether a number is an observation, a score, an estimate or a recommendation.

## Evidence ledger

### Observed and settled facts

- The MVP has three persistent holding families: Investments, Loans and Insurance.
- Each family must remain reachable even when empty; empty states teach mechanisms and retain a secondary
  manual-add path.
- The backend returns separate family totals and explicit valued/unvalued/excluded/invalid counts. It does
  not calculate a single signed net-worth number.
- Portfolio allocation currently counts records, not rupee value. Category concentration counts only broad
  mutual-fund categories and is explicitly not scheme-level overlap.
- Portfolio Health exposes four levers: investment rate, insurance, emergency buffer and tax utilisation.
- Real product/institution names may appear to the authenticated user but never cross the LLM boundary.
- Holding edits, deletion and recategorisation already have version/conflict and impact-review behavior.

### Assumptions to validate

- “Portfolio Health” plus a 0–100 number can be understood as a transparent coverage index rather than a
  judgment, recommendation or performance grade.
- Users can understand a record-count allocation chart that includes loans and insurance without reading it
  as rupee weighting.
- A non-performance trend teaching card is useful even though no history is stored.
- The hierarchy can expose structure, health, families, concentration and teaching without creating an
  implied order of financial priorities.

### Resolved reconciliation outcomes

- D-162 replaces the conflicting insurance formulas with separate health presence, term presence and recorded
  cover-to-income ratio components; no combined insurance score or adequacy threshold.
- D-163 removes the overall Portfolio Health score at every completeness level; individual mechanisms remain.
- D-164 makes optional health-insurance presence account-owned with full privacy/user-control treatment.
- D-165 removes categorical score bands and headline grades.

## Fundamental outcome

Without coaching, a user can accurately explain:

- what each Portfolio number counts or sums;
- which records contributed and which did not;
- that unknown is not zero and absence is not deficiency;
- that Portfolio Health measures four defined inputs, not personal worth or investment performance;
- that category concentration is a category count, not underlying-stock overlap or advice; and
- how to open, correct, add or learn about any family while retaining control over disclosure.

## Core mechanism

`owned records + explicit provenance + known calculation rules`

`→ separate factual views + visible unknowns/limits`

`→ user-selected inspection, correction or teaching`

`→ refreshed authoritative picture`

The product creates value only if every transformation remains legible. More visual polish does not improve
the outcome when source, unit, denominator or missing-data treatment is unclear.

## Product principles

- **Structure before score:** orient the user to recorded families and data state before asking them to read
  a composite measure.
- **Unit before figure:** every number names whether it is rupees, records, months, percent or points.
- **Partial is not zero:** unavailable, unknown, invalid, excluded and genuinely empty remain distinct.
- **Mechanism before action:** every drill-down explains formation and limitations before offering correction
  or teaching routes.
- **No implied priority:** order is stable information architecture, not a ranking of financial problems.
- **User-controlled capture:** AI-assisted capture remains primary and manual add remains available but
  secondary; disclosure never gates access.
- **One failure stays local:** a failed source does not erase successful families or fabricate a complete
  fallback.
- **Account isolation is immediate:** permission loss or account transition removes prior-subject data before
  the next state renders.

## Information architecture

1. Account identity, freshness and data-state summary.
2. Recorded structure across Investments, Loans and Insurance, with explicit unit/provenance.
3. Portfolio Health summary and four independently inspectable mechanisms.
4. Persistent family routes and their recorded/empty/error states.
5. Category concentration with identical “shows / cannot tell” limits.
6. Trend teaching that states why no performance trend exists without snapshots.
7. User-chosen routes to inspect, edit, add, learn or ask Arya.

This hierarchy is a prototype hypothesis, not a new decision. BQ-128 must test whether it reads as
orientation rather than priority.

## Success criteria

- Every family and recorded item is reachable in two deliberate interactions or fewer.
- No state converts unknown, invalid, excluded or unavailable data to zero.
- Every chart/figure exposes its unit, source boundary and missing-data rule.
- A user can distinguish record-count allocation, family rupee totals, category counts and Portfolio Health
  points without coaching.
- Partial failure, stale data, offline state, permission loss and account switch have recoverable, fail-closed
  paths with no prior-account residue.
- Empty families provide neutral teaching, optional Arya/capture and secondary manual add with no purchase
  prompt or deficiency framing.
- Portfolio Health, concentration and ordering contain no good/bad, optimize, fix, priority or recommendation
  language and no financial valence color.
- Keyboard, screen reader, mobile, wide, 200% text, light/dark/system and reduced-motion behavior pass.

## In scope for the validated prototype

- Portfolio overview and Portfolio Health detail.
- Investments, Loans and Insurance family entry, empty, populated, partial and failed states.
- Holding-detail destination and controlled edit/delete/recategorisation consequence previews.
- Record-count allocation, separate family totals, category concentration and non-performance trend teaching.
- Loading, stale/offline, partial/invalid, permission, account transition and recovery behavior.
- Controlled fixture actions only; no network, model, analytics or durable browser/device storage.

## Exclusions

- Production implementation or repair.
- New formulas, formula changes, schema fields, persistence decisions or money calculations.
- Real estate, Cash & bank, Alternatives, account aggregation, market feeds, historical performance,
  benchmarks, returns ranking, rebalancing, product recommendations or scheme-level overlap.
- A synthetic net-worth figure or asset-minus-debt verdict.
- External-user research; that remains D-124's integrated activation test.

## Dependencies

D-009..D-013, D-031, D-059, D-065, D-076, D-089, D-096, D-104, D-106, D-109..D-112,
D-137, D-142, D-145, D-148, D-149, D-155, P1/P2/P6/P8/P9/P10/P11, and the existing holdings,
consolidated, budgeting, context, export/deletion and authentication contracts.
