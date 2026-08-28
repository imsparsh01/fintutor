# Home product requirements

## User and problem

A returning FinTutor user needs one calm place that says what the app currently knows, what it cannot yet
measure, and where each useful action lives. The current eight-section feed has broad capability but may ask
the user to interpret too many equally weighted blocks.

## Observable outcome

Without coaching, the user can:

1. distinguish recorded, unknown, excluded and temporarily unavailable information;
2. find their overall financial picture and understand that it is not a net-worth verdict;
3. enter Arya, Portfolio Health, a calculator, a scenario, teaching content or progress deliberately;
4. recover one failed section without treating the whole Home as empty;
5. identify the current account and reach privacy, context, export, logout and deletion controls;
6. explain that Home displays facts and routes, but does not choose a financial priority.

## Product principles

- **Orientation before promotion:** identity, data freshness and financial picture precede discovery surfaces.
- **Facts before actions:** Home reports what is known, then offers user-chosen routes. No “next best action.”
- **Partial is not zero:** missing, unreadable, excluded and unavailable data get distinct words.
- **One failure stays local:** independently loaded sections fail and retry independently.
- **Progress is participation:** learning progress and streaks never react to financial outcomes.
- **Exit is real:** privacy, export, logout and deletion remain reachable without scrolling through persuasion.

## Information hierarchy

1. Account identity and refresh status.
2. Financial picture with three family totals and provenance limits.
3. Portfolio Health coverage and drill-down.
4. Arya as the primary teaching route.
5. User-chosen tools: calculators and scenarios.
6. Learn and participation progress.
7. Context, privacy and account controls.

This changes emphasis, not MVP scope. All D-104 areas remain reachable.

## Success criteria

- Every required area is reachable in two deliberate interactions or fewer.
- No fixture state renders an unknown family as ₹0.
- Refresh, stale and partial states preserve last-known provenance without presenting it as current.
- The primary Home copy contains no recommendation, ranking, urgency or valence treatment.
- Keyboard order follows visual order; every control has a unique accessible name and visible focus.
- Mobile, wide, light, dark and reduced-motion modes remain usable.

## Exclusions

- New financial calculations or a net-worth formula.
- Personalized ranking, “next best action,” notifications or product suggestions.
- Production implementation, navigation changes, analytics changes or new dependencies.
- External-user evidence; that remains the later D-124 integrated activation test.

## Dependencies

D-104, D-111, D-137, D-142, D-149, D-153 to D-155, P7, P9, P10, P11, and the existing consolidated,
health, progression, assessment, export, deletion and auth contracts.
