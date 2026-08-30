# Calculator Suite — Consolidated Contracts

**Status:** BQ-146 definition contract  
**Applies to:** nine approved production Calculators  
**Authority:** D-105, D-128, D-129, D-145, D-146, D-173

Unresolved rows marked **OWNER FORK** are deliberately not formulas or defaults. BQ-147 must route them before prototype formula evidence or production reconciliation.

## C1. Suite ownership and taxonomy

- A Calculator answers one user-chosen arithmetic question from user-authored assumptions. It does not compare endorsed paths, infer intent, diagnose a portfolio, choose a target or make a recommendation.
- Tools exposes exactly nine equal entries: SIP Goal Planner, Home Loan EMI, Inflation Impact, Step-up SIP, CAGR, Compound Growth, Credit-card Payoff, Emergency Coverage and Goal contribution gap.
- Scenarios remain a separate Tools category; contextual focused explorers remain outside the Calculator catalogue.
- Tax/HRA and every catalogue addition remain unavailable unless their separate gates close.

## C2. Shared lifecycle

1. Open produces a clean draft, no result and no completion event.
2. Candidate-capable tools load each owned source independently without blocking manual entry.
3. Recorded values are visibly attributed, editable and excluded until explicit inclusion unless a specific existing contract says otherwise.
4. Calculate validates a frozen snapshot. Repeated activation while busy is idempotent.
5. A valid current result includes the exact inputs used, formula/convention, rounding/caps and omissions.
6. Any dependent edit, candidate refresh/selection change, permission loss or account change immediately removes the result, handoff and result-completion eligibility.
7. Reset clears manual draft, errors and result; source records return only as separately offered candidates.
8. Close/reopen starts clean. Nothing persists or silently uploads.

Exact neutral invalidation copy: **“Inputs changed — run again to see a result for these values.”**

## C3. Numeric grammar and safety

- Every input uses the approved whole-string Scenario numeric grammar as the suite precedent: plain digits/decimal, correctly grouped Indian or international thousands; surrounding whitespace may be trimmed.
- Reject partial parses, mixed grouping, repeated separators, exponent notation, hex/binary, signs without digits, `Infinity`, `NaN`, non-numeric suffixes and unsafe integer precision.
- Blank/unknown/malformed never becomes zero. A real entered or recorded zero remains zero where the formula contract permits it.
- Validate raw inputs, converted periods/rates, every iterative intermediate and every output before display. Never render NaN/Infinity or treat overflow as a reached/capped result.
- **OWNER FORK O-CA-1:** exact amount/rate/period/output ceilings for the nine formulas. Existing newer-tool ceilings are evidence, not silent authority for older tools.

## C4. Assumption authorship and provenance

- Rates, targets, horizons, payments, step-ups, contribution amounts and other future-world assumptions are user-entered. FinTutor supplies no typical/default/recommended value.
- Recorded candidates name source family/record alias as allowed in UI, source field, durable version and honest retrieval evidence. “Current” is never inferred from request time.
- Candidate inclusion is explicit; candidate edits become “entered by you.” Calculator drafts never write back to holdings, income, goals, context or budget.
- Result input summaries distinguish user-entered, included-recorded and omitted values. Exclusions remain visible where they affect interpretation.
- Pure manual calculators make no authenticated data request.

## C5. Formula and presentation table

| Type | Inputs | Binding mechanism/convention | Required outputs and omissions | Open authority |
|---|---|---|---|---|
| SIP Goal | target, annual rate, years | Inverse future value of equal month-end contributions; each contribution compounds from following month | monthly contribution; exact months, fixed-rate assumption; tax/fees/volatility/missed contributions omitted | **O-CA-2:** zero-rate branch, fractional-year conversion, exact domains/rounding |
| Home Loan EMI | principal, annual rate, tenure | Fixed monthly amortisation; monthly interest then principal reduction | EMI, total interest, months; fees/prepayment/rate changes/daily lender rounding omitted | **O-CA-3:** zero-rate branch, fractional tenure, exact domains/rounding |
| Inflation Impact | present cost, annual rate, years | Annual compounding of entered rate | modeled future cost; fixed-rate assumption; category variation/tax omitted | **O-CA-4:** whether negative inflation is valid, fractional years, exact domains/rounding |
| Step-up SIP | starting monthly contribution, annual step, annual rate, years | Month-end contributions; new step at first contribution of each 12-month block | ending corpus, total contributed; fixed rates/step, fees/tax/volatility/misses omitted | **O-CA-5:** zero return, fractional years, exact domains/rounding |
| CAGR | initial value, final value, years | `(final / initial)^(1/years) - 1`; smooth historical equivalent only | signed annualised rate; no cash-flow handling, tax/fees or forecast claim | **O-CA-6:** fractional years, exact domains/rounding |
| Compound Growth | lump sum, monthly contribution, annual rate, years | D-129 month-end contribution, monthly compounding, rounded modeled month count | ending amount, total contributed, arithmetic difference | Existing pure contract; BQ-147 checks consistency of 200y/1,000% ceilings rather than changing them silently |
| Credit-card Payoff | balance, annual rate, fixed payment | Monthly interest then payment; final payment clamps to amount due; 1,200-month cap | months, total paid/interest, final payment; no new spend/fees/penalty/daily issuer rules | Existing pure contract; candidate eligibility/provenance needs suite ruling |
| Emergency Coverage | included cash/bank, FD, other accessible, monthly outgoings | Sum included accessible balances ÷ positive monthly outgoings | accessible total and months; no adequacy target or liquidity guarantee | Existing shared mechanism; source inclusion/freshness aligns with Scenario precedent |
| Goal contribution gap | target, current amount, planned monthly, annual rate, years | Current amount compounds; inverse month-end contribution closes remaining modeled target; signed `planned - modeled` | modeled contribution and signed difference; no affordability/on-track verdict | **O-CA-7:** saved-goal candidate scope and exact equality/current≥target presentation |

All rupee display uses existing India formatting and a documented rounding boundary. Display rounding never feeds subsequent arithmetic.

## C6. Result content

Every result has this order:

1. named primary figure and unit;
2. secondary figures, if any, from the same frozen snapshot;
3. `Inputs used` with authorship/provenance and exact units;
4. `Formula and convention` in plain language;
5. `Rounding, caps and omissions`;
6. optional bounded teaching handoff; and
7. `What we won't say` where the figure is easily mistaken for advice/adequacy/forecast.

Forbidden: better/worse, success/failure, on/off track, affordable/unaffordable, safe/unsafe (as outcome judgment), adequate/inadequate, likely/expected, recommended, urgency, celebration, financial red/green, winner ordering or outcome CTA.

## C7. Candidate/API and recovery

- Credit-card candidates: only verified owned `credit_card_debt` records with an available balance/rate field explicitly approved by BQ-147. No guessed payment.
- Emergency candidates reuse backend-authored component enumeration rather than independently summing raw records in UI.
- **OWNER FORK O-CA-8:** Goal contribution gap candidate scope. Binding a saved goal/holding relationship changes provenance and must be explicitly approved; no silent production inference.
- 401/403 means permission loss and synchronous data clear; 404 means selected owned record unavailable; 5xx/network means retryable source failure; empty is normal absence.
- Offline manual calculation is local-only. No request is queued or replayed. Source-dependent values are not fabricated; reconnect requires explicit retry.
- Request generation binds user, account generation and screen session. Late prior responses are discarded with zero result/event/state mutation.

## C8. Privacy, model and persistence

- Calculator inputs/results are transient in memory: no result history, analytics payload, log, local storage or DB record.
- Progression receives only stable calculator type/capability keys; never values, signs, bands, result categories or source IDs.
- **OWNER FORK O-CA-9:** eligible Arya handoffs. Any approved handoff must show the exact payload and require confirm; cancel makes zero call. Payload may contain normalized numbers and formula boundary/omissions but no names, aliases, institutions, record IDs/source records or verdicts.
- Model failure retains existing explicit-retry behavior and cannot alter the Calculator result.

## C9. Progression

- Emit `calculator_completed` only after a valid current result commits to UI.
- Stable subject key is calculator type; existing backend rule remains once/type/day and twice/calculators/day plus first capability use.
- No event on open, edit, candidate load/include, invalid attempt, capped/no-result, retry, reset, handoff or result re-render.
- Fire-and-forget failure/cap/duplicate cannot change result, language, navigation or pressure.

## C10. Accessibility and responsive behavior

- One heading, named input plus visible unit, programmatic hint only when useful, associated field/summary error, correct disabled/busy/selected state and ≥44px targets.
- Invalid submit focuses/scrolls the first invalid field and announces one coherent alert. Current result announces once with identity/unit and receives logical native focus; web uses standards flow and never calls native-only imperative focus.
- Keyboard order follows visual order. Any confirmation modal traps focus, hides background, closes by Escape/system back and restores the exact opener.
- At 320px, representative phone, 1440px and 200%: one-column reflow where required, bounded reading width, no clipped adornments, overlap, horizontal page scroll or unreachable action.
- Light/dark/high contrast/reduced motion preserve meaning, AA contrast and visible focus; motion is never required to understand a result.
- Static/DOM/console audit requires no syntax errors, runtime warnings, duplicate IDs, unnamed inputs/actions, nested controls, heading gaps or forbidden storage/model APIs.

## C11. Calculator-specific validity states

- Equality, zero and signed negative outcomes are valid where the approved formula allows them; language remains factual.
- Iterative calculators report an explicit no-result cap, not a partial result.
- `current >= target` may produce a zero modeled contribution only under the approved goal formula; it cannot trigger celebration or advice.
- CAGR loss is a signed historical annualised rate, not a warning state.
- Emergency zero accessible balance is a measured zero-month result when monthly outgoings are valid, not invalid input.

## C12. Release and evidence gates

- BQ-147 must give every clause a stable acceptance ID, map all 51 states and resolve O-CA-1..O-CA-9 through the decision protocol.
- BQ-148 controlled prototype and QA cannot substitute for later production evidence.
- Owner PASS freezes the definition. Production work then receives separate formula, UI/lifecycle, provenance/handoff and exhaustive parity queue items.
