# Scenario and focused-explorer product requirements

## Bottom line

The suite is a **user-authored consequence modeller**, not a forecasting or recommendation engine. It helps a
user compare what follows from assumptions they deliberately choose, understand which recorded facts were
offered as editable starting points, and leave with the mechanism rather than a selected action.

Its core trust problem is authorship. A mathematically correct result becomes misleading if the user cannot
tell which rate, horizon, target, component or saved value came from them, from their account, or from an app
assumption. FinTutor therefore must expose provenance and keep every consequential choice under user control.

## User and problem

An adult learner working with their own financial context needs to answer questions such as:

1. What changes if I alter one contribution, horizon, rate, payment or included component?
2. What do two self-chosen paths produce under the same clearly stated model?
3. Which recorded values can start the exploration, and which remain unknown or unavailable?
4. What does the result calculate, omit and refuse to conclude?

Without a shared contract, a prefilled number can look authoritative, a user-entered rate can look like a
FinTutor forecast, an old result can survive changed inputs, and side-by-side arithmetic can read as advice.

## Evidence ledger

### Observed and settled facts

- Tools is the canonical suite home. Home may show limited previews plus “View all tools.”
- Five dedicated scenarios exist: Emergency runway (S-05), Increase my SIP (S-03), Debt cost (S-06), Idle
  cash over time (S-07), and Time to a user-set corpus (S-01).
- Four focused explorers exist: Loan prepayment versus investing (S-02), ESOP exercise cost, 80C unused room,
  and term-insurance household-support scenarios.
- A scenario starts with a financial situation or recorded context and lets the user change assumptions. A
  focused explorer is entered from a relevant record/context and exposes one bounded mechanism in more depth.
- Every rate, target, horizon and consequential inclusion is user-entered or explicitly user-selected. The app
  supplies no expected return, benchmark, assumed savings rate, inflation default or recommended target.
- Account values may be offered only as source-labelled, editable candidates. A scenario edit is transient and
  never silently writes back to the baseline.
- D-130 limits emergency runway to user-entered cash/bank, editable FD principal, optional user-known accessible
  amount and editable outgoings; retirement/RD values are not automatically included.
- Term-insurance scenarios expose selected additions/offsets, entered cover and a signed arithmetic difference;
  no required/adequate/shortfall/surplus judgment is permitted.
- A valid newly rendered scenario may emit capped participation progress independent of the result. Opening,
  changing assumptions or producing a financially larger/smaller output earns nothing extra.

### Observed implementation gaps

- Four functions in `app/lib/scenarios.ts` have no direct unit tests; the suite has no integrated interaction
  coverage across screens/modals.
- Dedicated scenario prefills collapse loading, empty, one-source failure and complete failure into too few UI
  states, and stale prior-account requests can win after an account/type transition.
- Several results remain visible after an input changes, so result provenance can disagree with current fields.
- Some calculations lack finite/overflow guards; extreme input can produce a non-finite result.
- Accessibility semantics, result announcement/focus and modal focus handling are inconsistent.
- Discovery and progression behavior differ among dedicated scenarios and focused explorers.

### Assumptions to validate

- Users can understand a stable distinction between a Calculator, a Scenario and a focused Explorer without
  treating the labels as different quality or priority levels.
- “From your data” plus exact source/freshness is sufficient to make an editable prefill feel disputable.
- Side-by-side output can remain neutral when ordering, color, copy and exits never pick a winner.
- Invalidating a result immediately after any dependent input change is clearer than retaining a visibly stale
  result with a warning.
- Contextual explorers can remain discoverable without duplicating every entry in Tools.

### Decision status for BQ-132

1. **O-SC-1 — S-07 name:** keep D-106’s advice-adjacent “Inaction tax” label or use the already-shipped
   mechanism label “Idle cash over time.”
2. **O-SC-2 — RESOLVED by D-167:** Tools lists the five dedicated scenarios under **Scenarios**. Focused
   explorers remain contextual deliberate actions and are not duplicated as context-free Tools cards.
3. **O-SC-3 — RESOLVED by D-168:** editing a dependent input immediately removes the prior result and shows
   “Inputs changed — run again to see a result for these values.”

## Fundamental outcome

Without coaching, a user can correctly explain:

- which values and assumptions produced a result and who supplied each one;
- that a saved-data prefill is editable and may be stale, partial or unavailable;
- that a user-entered rate is not FinTutor’s forecast;
- what each path calculates and what it omits;
- that a difference is arithmetic, not a verdict or recommended action; and
- that closing, editing or rerunning a scenario does not change their stored financial baseline.

## Core mechanism

`explicit user question + source-labelled editable candidates + user-owned assumptions`

`→ bounded transparent formula + visible omissions/unknowns`

`→ one or more neutral consequence outputs`

`→ user-selected teaching, edit, reset, exit or optional confirmed handoff`

Trust fails if any consequential input becomes an invisible default, if current fields and shown result diverge,
or if presentation turns a mathematical difference into a preferred path.

## Product principles

- **Authorship before arithmetic:** identify who supplied every consequential input before showing a result.
- **Rates belong to the user:** no app default, benchmark or “typical” rate enters a scenario calculation.
- **Prefill is an invitation, not authority:** source, freshness and editability stay visible.
- **Current inputs own the result:** a changed dependent input cannot leave the prior result looking current.
- **Unknown is not zero:** missing, failed, malformed, stale and intentionally excluded remain distinct.
- **Compare consequences, never paths:** ordering, copy, color and progression cannot select a winner.
- **One formula, one explanation:** every output names unit, operation, rounding, cap and omitted effects.
- **Transient by default:** scenario drafts/results do not update holdings, goals, income, context or reminders.
- **Local failure stays local:** one unavailable source does not erase manual entry or independently loaded facts.
- **Account isolation is immediate:** old-account candidates, drafts, results and dialogs clear before transition.
- **Teaching is optional:** mechanism explanations and Arya handoffs never gate exit or reward financial action.

## Suite inventory and intended job

| ID | Surface | Primary job | Settled output boundary |
|---|---|---|---|
| S-05 | Emergency runway | Model months covered by explicitly accessible amounts | Accessible balances ÷ entered outgoings; no adequacy target |
| S-03 | Increase my SIP | Compare current versus increased monthly contribution | End corpus and difference under user-entered rate/horizon |
| S-06 | Debt cost | Understand remaining repayment interest | EMI, total payable/interest and next-year interest from entered loan terms |
| S-07 | Idle cash over time | Compare one cash amount under two user-owned rates | Two future values and signed difference; no path verdict |
| S-01 | Time to corpus | Find when current corpus/contribution reaches user target | Months/years or not reached within 60-year cap |
| S-02 | Loan prepayment effects and investing hurdle | Inspect how a user-entered prepayment changes the selected loan under two fixed-amortisation modes | Tenure-reduction and EMI-reduction consequences plus the stored loan rate as a hurdle; no investment-return assumption, horizon or projected investment outcome |
| EX-ESOP | ESOP exercise cost | Explain exercise cash requirement and current spread | Exercise cost, taxes/fees excluded, paper spread described neutrally |
| EX-80C | 80C unused room | Explain recorded eligible contributions against statutory cap | Included recorded amount and clamped unused room; not tax advice |
| EX-TERM | Household-support scenarios | Explore user-selected support components and cover | Component sum, entered cover and signed difference; no need verdict |

## Information architecture

1. Tools suite entry with clear calculator/scenario distinction and explicit deferred boundaries.
2. Scenario question, source/freshness state and editable candidate inputs.
3. User-entered assumptions, inclusions and exclusions.
4. Run action only when a finite honest result is possible.
5. Result with unit, formula/provenance summary, omissions and non-recommendation boundary.
6. User-selected edit/rerun/reset, mechanism teaching, relevant record, Arya or exit route.
7. Contextual focused-explorer entry from a relevant holding/budget/insurance surface under D-167; it is a
   deliberate mechanism action and is not duplicated as a context-free Tools card.

This order is information architecture, not a ranking of financial actions or scenario importance.

## Success criteria

- Every shipped scenario/explorer is reachable from its approved entry and returns without a dead end.
- Every displayed result maps to the currently visible inputs; any edit produces the approved O-SC-3 state.
- Every rate/target/horizon/consequential inclusion is visibly user-entered or user-selected.
- Every prefill names source, freshness and editability; partial/failure/unknown never becomes zero.
- All formulas reject malformed, negative where prohibited, non-finite and overflow-producing inputs.
- Equal, negative, crossing and zero differences remain arithmetic facts without valence or recommendation.
- Account switch, permission loss and late response leave no prior-subject candidate, draft, result or modal.
- Scenario edits/results remain transient; no network write, durable device storage or model call occurs without a
  separately confirmed action.
- Progression occurs only for valid learning participation, is capped, and never varies with financial result.
- Keyboard, screen reader, mobile, wide, 200% text, themes and reduced motion pass across every screen/modal.

## In scope for the validated prototype

- Tools discovery plus the five dedicated scenarios and four focused explorers.
- Empty/manual, loading, partial, failed, stale, invalid, zero, equal, negative/crossing and capped result states.
- Source-labelled recorded candidates, explicit include/exclude/edit and transient reset.
- Local retry, changed-input behavior, permission loss and in-flight account transition.
- Controlled fixtures only; no network, model, analytics or durable browser/device storage.

## Exclusions

- Production implementation or repair under BQ-130..BQ-134.
- Rent-versus-buy S-04, income-tax/HRA calculators, XIRR, additional catalogue or automatic trigger detection.
- App-chosen rates, targets, time horizons, recommended contributions/payments/cover or benchmark returns.
- Product/security/insurer comparison, quote, lead generation, purchase or account aggregation.
- Scenario-result persistence or silent write-back to baseline/context.
- External launch of insurance/tax framing before qualified India counsel review.

## Dependencies

D-009, D-014, D-025, D-059, D-066, D-068..D-070, D-091, D-103, D-105, D-106, D-108,
D-117, D-128..D-132, D-134, D-137, D-145, D-148, D-155, D-166 and P1/P2/P6/P9/P10/P11.
