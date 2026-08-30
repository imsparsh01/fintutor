# Calculator Suite — Product Requirements

**Status:** BQ-145 current-state reconciliation  
**Scope:** nine approved production Calculators  
**Product boundary:** transparent conditional arithmetic, never advice or forecast

## 1. User outcome

A user can choose one financial question, supply or explicitly include the assumptions that drive it, see a bounded result, and understand the mechanism, timing, units, rounding and omissions well enough to make their own interpretation. FinTutor does not select an assumption, target, payment, rate, horizon, product or action.

## 2. Suite inventory

| Type | User question | Current engine | Current data relationship |
|---|---|---|---|
| SIP Goal Planner | What monthly contribution reaches my chosen target under my chosen rate and horizon? | Embedded in `CalculatorScreen.tsx` | Manual only |
| Home Loan EMI | What fixed monthly instalment and total interest follow from my entered principal/rate/tenure? | Embedded | Manual only |
| Inflation Impact | What does today's entered cost become under my entered inflation rate and horizon? | Embedded | Manual only |
| Step-up SIP | What corpus follows if my entered monthly contribution rises by my entered annual step? | Pure `stepUpSip.ts`, screen orchestration embedded | Manual only |
| CAGR | What smooth annualised historical rate connects my entered initial and final values? | Embedded | Manual only |
| Compound Growth | What amount follows from my entered lump sum, recurring amount, rate and horizon? | Pure `compoundGrowth.ts` | Manual only |
| Credit-card Payoff | How long does an entered fixed payment take under an entered balance and rate? | Pure `creditCardPayoff.ts` | Manual plus optional attributed eligible holding candidate |
| Emergency Coverage | How many months do explicitly included accessible balances cover? | Shared pure `emergencyCoverage.ts` and component | Manual plus attributed budget/FD candidates |
| Goal contribution gap | What signed difference exists between my planned contribution and the modeled contribution for my chosen goal inputs? | Pure `goalAffordability.ts` | Manual; current screen does not bind a saved goal |

## 3. Entry, return and exit

- Tools lists exactly the nine approved calculators as equal deliberate choices beneath the `Calculators` heading.
- Home may preview a representative calculator but must preserve `View all tools`; Onboarding may hand off to Tools without choosing a calculator.
- Opening starts a fresh draft unless a later contract explicitly approves subject-scoped restoration. Calculator results are not persisted.
- Back/exit returns to the exact caller when navigation supports it. Reopening cannot expose another account's draft, candidate, result or progression state.
- A current eligible result may later offer a bounded, confirmed Arya mechanism handoff only if its exact privacy-minimised payload is approved; no current calculator has that production integration.

## 4. Shared functional requirements

1. Every consequential assumption is user-entered or an explicitly included, source-labelled, editable candidate.
2. Blank, unknown, malformed, partial, non-finite and out-of-domain inputs never become zero or a result.
3. Whole-string numeric grammar, formula-specific domains, intermediate/output safety and integer-vs-fraction rules must be explicit before production reconciliation.
4. `Calculate` is deliberate and idempotent. A screen visit, field edit, candidate load, error or retry is not completion.
5. A result freezes the exact inputs used. Editing any dependent input immediately removes the old result, its handoff and its completion eligibility.
6. Reset clears manual draft, errors and result while returning recorded values only to separately offered candidates.
7. Result presentation names the figure and unit, formula/convention, source authorship, rounding/caps and material omissions.
8. Progression emits only after a valid current result renders, at most under the existing backend type/day and suite/day caps. Failure or cap cannot change the result.

## 5. Money and content boundary

- D-129 owns recurring month-end contribution timing. Every applicable result must disclose that contributions begin compounding in the following month and annual step-up begins at the next 12-month block.
- A historical CAGR describes a smoothed past rate and never implies future return.
- EMI/payoff calculations explain interest timing and exclusions without recommending a payment or tenure.
- Inflation/growth/goal results are conditional on user-entered fixed rates, not forecasts.
- Emergency Coverage is a division mechanism, not an adequacy score or target.
- Goal contribution gap is signed arithmetic, not an affordability verdict.
- Values use neutral ink/monospaced styling: no success/failure colours, arrows, celebration, urgency, “on track,” “shortfall,” “better,” “safe,” “adequate,” “expected,” or recommendation CTA.

## 6. Data, privacy and persistence

- Pure manual calculators remain local-only; they need no API call and store no inputs/results.
- Optional recorded candidates require verified ownership, stable record/field/version identity and honest retrieval evidence. They begin excluded unless an existing owner-approved contract states otherwise.
- Editing a candidate creates calculator-draft authorship and never writes back to the baseline.
- No raw financial inputs/results enter analytics, progression subject keys, notification copy or an LLM payload.
- Account/logout/generation changes clear draft/result synchronously and discard late responses.

## 7. Accessibility, responsive and recovery

- One visible heading; programmatic labels and units; associated errors; selected/busy/expanded state; minimum 44px targets.
- Valid result announces exactly once and receives logical focus/scroll on native without using unsupported web imperative focus.
- Keyboard reaches every control in order; modals trap/restore focus and support Escape/system back.
- 320px, representative phone, 1440px and 200% reflow without clipping, overlap or horizontal page scroll.
- Light/dark/high-contrast/reduced-motion preserve meaning, contrast and focus.
- Source/API failure is distinct from no candidate. Safe manual calculation remains available where its own inputs are complete; retry is explicit and source-local.

## 8. Current production strengths

- All nine approved tools are reachable from Tools.
- Newer pure engines have meaningful finite/domain/overflow tests and neutral disclosures.
- Recurring-contribution timing is aligned to D-129 where extracted.
- Emergency Coverage has attributed candidate handling and current-result emission guards.
- Results use neutral presentation and native-only accessibility focus guarding.
- Backend progression caps and failure isolation already exist.

## 9. Current contradictions and open forks

These are inputs to BQ-146/BQ-147, not decisions made by BQ-145:

1. The embedded SIP, EMI, Inflation and CAGR engines use `parseFloat`, lack complete finite/domain/output guards and have no dedicated exact fixtures.
2. Zero-rate behavior is inconsistent: newer growth/payoff tools support explicit zero where meaningful; older SIP/EMI/Inflation paths reject it without a logged per-formula contract.
3. Older calculators and several newer screens retain a visible stale result after dependent edits; Goal contribution gap and Emergency Coverage already invalidate.
4. Screen-level whole-string grammar, error association, first-invalid focus, reset and clean-reopen behavior are inconsistent.
5. Formula rounding/display rules, caps and omission blocks are not standardized across nine entries.
6. Recorded-candidate provenance/exclusion/retry semantics exist only on selected calculators and are not suite-wide.
7. No Calculator has the confirmed masked Arya teaching handoff used by Scenarios; whether and how each mechanism qualifies requires explicit contract/acceptance review.
8. Web/native rendered interaction, keyboard, 200%, theme/motion, DOM/console and all-state evidence is incomplete.

## 10. Explicit exclusions

- Income-tax and HRA calculators until BQ-098's financial-year/source/reviewer/stale/legal gates close.
- XIRR, rent-versus-buy, transaction history, institution-specific daily-interest/rounding, benchmark returns, product names and new catalogue entries.
- Saved calculator history, automatic recommendations, app-chosen assumptions, target adequacy, outcome scoring and financial-result-based rewards.

## 11. Definition of validated

The workstream is validated only when every approved calculator and every state has a traceable acceptance row, unresolved money/data/advice decisions are owner-ruled, the controlled prototype passes exhaustive agent QA, and the owner records PASS. Production parity is a later separately bounded gate.
