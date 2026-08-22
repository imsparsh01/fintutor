# Baseline owner decision brief

## O-01: How much non-holding lifecycle management belongs in MVP?

- **Trigger:** expanding income/discretionary/goal edit-delete capabilities may grow MVP scope; current product
  language implies correction but only holdings have the full lifecycle.
- **Path A:** keep current create/append plus goal-funding edit. Consequence: explicitly document limits and
  remove dead-end “edit” language.
- **Path B:** add full edit/delete for income sources, discretionary categories and goals. Consequence: coherent
  correction model, more APIs/UI/deletion-impact work.
- **Path C:** add correction only for invalid inputs and keep broader deletion deferred. Consequence: closes
  budget dead ends but creates different management depth by state.
- **Owner judgment:** whether correction consistency is already implied MVP scope or new scope.

## O-02: What does goal progress mean?

- **Trigger:** money logic. Documentation says progress reads linked holdings' current values; runtime sums
  static `earmarked_amount` links.
- **Path A:** progress is the sum of earmarked planning amounts. Consequence: stable and simple, but does not
  reflect market/value movement.
- **Path B:** progress is live available value from linked holdings, capped/allocated by an explicit rule.
  Consequence: responsive but requires valuation, allocation and unknown-value semantics.
- **Path C:** remove the word progress; display only funding-plan labels until a live rule is approved.
- **Owner judgment:** which mechanism users should rely on. Legal/fintech review remains external-launch work.

## O-03: How should direct edits handle stale data?

- **Trigger:** low-reversibility architecture and financial-data correctness. Direct PATCH can overwrite a
  newer cross-device edit; reconciliation already uses row-lock stale detection.
- **Path A:** retain last-write-wins and disclose refresh behaviour. Lowest build cost, weakest protection.
- **Path B:** version/timestamp compare and explicit refreshed reconfirmation. Strong protection, schema/API work.
- **Path C:** refetch-before-submit without a durable version. Smaller change, cannot eliminate races.
- **Owner judgment:** acceptable stale-overwrite risk for internal MVP and later launch.

## O-04: What happens when the holding saves but reminder scheduling fails?

- **Trigger:** data correctness and architecture. Current UI may say save failed after the server committed,
  inviting duplicate creation.
- **Path A:** holding success is authoritative; reminder failure is a separate non-blocking notice/retry.
- **Path B:** remove reminder scheduling from holding-save UI and refresh it independently.
- **Path C:** attempt compensating rollback. Consequence: high complexity and can erase a valid financial record.
- **Owner judgment:** desired coupling and recovery contract. Path C has the highest data-loss risk.

No recommendation is recorded because the owner did not ask for one. These four decisions block package freeze,
not completion of the controlled prototype.
