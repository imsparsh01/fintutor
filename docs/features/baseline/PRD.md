# Personal financial baseline PRD

## Bottom line

FinTutor needs a baseline the user can correct and trust before Arya, Portfolio Health, budgets or tools reuse
it. The desired outcome is not a full financial inventory. It is an explicit, current-enough set of facts whose
unknowns, exclusions, provenance and downstream effects are understandable.

## Target users and job

Adults aged 18-32 who are beginning to organise income, holdings, spending and goals. They need to record only
what is useful now, correct it later, and distinguish missing information from a real zero.

## Observable outcome

A user can add or confirm a fact, locate it again, understand whether it is saved, correct it, see which derived
views changed, and recover from invalid or failed data without exposing another account's records.

## Principles

1. Explicit user action creates or changes durable financial data.
2. AI capture and manual capture converge on the same owned records; manual entry remains secondary.
3. Unknown, invalid, excluded and zero are different states.
4. Derived views name their sources and exclusions; they never pretend to be stored facts.
5. A record change must not imply a financial verdict or earn a behavioural reward.
6. Cross-account transition clears prior-account presentation before loading the next account.
7. Destructive or lossy changes disclose impact before confirmation.

## In scope

- Investments, loans and insurance holdings.
- Income floor/range sources and cadence.
- Discretionary planned categories.
- Goals and holding funding links.
- Computed monthly budget and consolidated valuation provenance.
- Manual capture, Arya-confirmed capture, correction, recategorisation and deletion where already approved.
- Loading, empty, partial, invalid, stale, failure, account-switch and recovery states.

## Exclusions

- New holding families, bank sync, transactions, advice, product evaluation or completeness scoring.
- Production API/schema/calculation changes.
- New edit/delete capability where the current MVP contract has not approved it.
- A new optimistic-concurrency mechanism or transactional reminder architecture.

## Evidence ledger

| Evidence | Class | Confidence |
|---|---|---|
| Holdings support manual and Arya-confirmed creation plus full edit/delete/recategorisation | Observed | High |
| Budget is computed live from conservative income, holding outflows and discretionary plans | Observed | High |
| Goals persist target/date/category and funding links; progress sums earmarked amounts | Observed | High |
| Unknown/unvalued/unclassified holdings remain visible in family/consolidated paths | Observed | High |
| Goals fetch failure can render as an empty state | Observed | High |
| Prior-account screen state is not consistently cleared before refetch | Observed risk | High |
| Users will understand funding links do not reserve money | Assumption | Low |
| Users can tell a computed exclusion from zero without coaching | Assumption | Low |
| Desired stale/offline policy for ordinary CRUD | Unknown | Open |

## Success criteria

- Every persisted change has an explicit user action and clear saved/not-saved state.
- Zero, unknown, invalid and excluded values remain distinguishable across the journey.
- Derived figures expose source records and excluded inputs.
- A partial failure never masquerades as an empty baseline.
- Account switching cannot display prior-account fixture data.
- Users can describe goal links as labels for planning, not moved/reserved money.
- Owner passes all settled prototype tasks; unresolved forks receive recorded decisions.

## Dependencies

D-009/D-010/D-012/D-013/D-031/D-038/D-059/D-078/D-133/D-137/D-142/D-145/D-148, plus the existing
holdings, reconciliation, income, goals, discretionary, budget, consolidated, export and deletion services.
