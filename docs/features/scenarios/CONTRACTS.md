# Scenario and focused-explorer contracts

**Status:** binding product-definition contract for BQ-131  
**Scope:** S-01, S-02, S-03, S-05, S-06, S-07, EX-ESOP, EX-80C and EX-TERM  
**Production effect:** none; observed implementation gaps become BQ-132/BQ-133 evidence, not silent changes

## 1. Purpose and authority

These tools let a person enter assumptions and inspect arithmetic consequences. They teach mechanisms; they
do not diagnose, rank, recommend, optimise or choose an action. The user's visible inputs own every result.
The decision records listed in the suite README outrank current code. Current code is implementation evidence
only where it agrees with those records.

The contract has four actors:

- the authenticated person, who selects sources and authors every consequential assumption;
- the client, which holds a transient draft and performs approved local calculations;
- owned backend reads, which may offer recorded candidates or calculate a read-only focused result;
- the progression service, which may record only a privacy-minimised participation event after a valid result.

No scenario writes holdings, goals, budget, financial context, reminders or Portfolio Health. No formula or
prefill calls a language model.

## 2. Suite, ownership and discovery

| ID | Surface | Calculation owner | Recorded candidates | Canonical entry |
|---|---|---|---|---|
| S-05 | Emergency runway | Client | FD principal; recurring and discretionary outgoings | Tools |
| S-03 | Increase SIP | Client | Equity/debt mutual-fund recurring outflows | Tools |
| S-06 | Debt cost | Client | Eligible loan balance/rate/months | Tools |
| S-07 | Idle-cash comparison | Client | None | Tools |
| S-01 | Time to user-set corpus | Client | Selected investment corpus and mutual-fund SIPs | Tools |
| S-02 | Loan prepay vs invest | Backend, read-only | Selected owned home/personal loan | Contextual explorer |
| EX-ESOP | ESOP exercise cost | Backend, read-only | Selected owned ESOP grant | Contextual explorer |
| EX-80C | 80C unused room | Backend, read-only | Eligible owned contributions/premiums | Contextual explorer |
| EX-TERM | Household-support scenarios | Client after optional owned reads | Debts, goals, offsets, recorded cover/context | Insurance context |

Tools is the canonical home for dedicated scenarios. Home may show limited previews only when “View all
tools” keeps every Home feature reachable. A contextual explorer opens only after deliberate action from an
eligible record/context, never from inferred urgency. Zero eligible records gives a neutral reason and normal
back/add/view routes; one shows its source before opening; many use an equal-order chooser with cancel.

D-167 resolves taxonomy/discovery: Tools lists the five dedicated scenarios under **Scenarios**. Focused
explorers remain contextual deliberate actions from eligible records/contexts and are not duplicated as
context-free Tools cards. “Focused explorer” is an internal term, not a third user-facing product category.

Back from a dedicated scenario returns to Tools. Closing a contextual explorer restores its exact origin and
opener. No route may dead-end or silently create, select or modify a financial record.

## 3. State and result lifecycle

The state sequence is `initial → loading/ready/partial/empty/failure → editing → calculating → current
result`. Loading, empty, unavailable, malformed, stale, intentionally excluded and measured zero are distinct.
Unknown or failed data never becomes zero.

Drafts, source candidates, selections, edits, consent, errors and results live only in component memory. They
clear on close, logout, account change, permission loss and scenario-type change. Reopening starts from a safe
initial state. Reset clears edits, inclusions, results and errors while leaving recorded values available only
as separately offered candidates; it never writes or deletes baseline data.

D-168 governs changed inputs: each dependent input edit immediately removes the prior result and shows
**“Inputs changed — run again to see a result for these values.”** No stale result is announced, handed off or
rewarded. Run is idempotent while busy and uses a stable visible input summary. Pure local calculations expose
no fake Cancel action; remote requests show Cancel only when abort/generation invalidation is real. A valid
zero, equal result or negative signed comparison is a real result, not an error. No result renders unless every
intermediate and output is finite.

## 4. Candidate provenance and freshness

Every offered candidate carries, where the source can truthfully provide it:

`source_kind`, internal `source_record_id`, user-readable `source_label`, `source_field(s)`, optional
`source_version`, optional `record_updated_at`, `retrieved_at`, `status`, `editable`, `included`, and
`original_value`.

`status` is one of `fresh`, `stale`, `unavailable` or `malformed`; absence is represented separately. A displayed
aggregate enumerates its components or explicitly says it is an aggregate source. Real display names may be
shown to the authenticated person but are never sent to a model.

Retrieval time proves only when FinTutor loaded a candidate in this session; it is not record freshness.
Holdings/goals currently expose versions but no update time; budget
aggregates expose neither component IDs/versions nor update times; financial context alone exposes
`updated_at`. A candidate may be labelled stale only when authoritative record-level evidence and an approved
freshness rule establish that status. Otherwise show **“Freshness unavailable · loaded this session at …”**
plus available version/source evidence; never call it fresh/current/stale. O-SC-8 governs any enrichment.

On refresh, an untouched field may accept a new candidate. A touched/manual field is never overwritten.
Present recorded-new versus draft-old with accept-new, keep-manual and reset-to-recorded choices. Retrying one
source replaces only that source.

## 5. Formula and output ledger

All rupee outputs are display-rounded as stated; calculations retain full finite precision until formatting.
“Reject” means no result, no progression event and an associated validation message. Exact numeric ceilings
that standing decisions do not set remain owner decisions for BQ-132; BQ-131 does not invent them.

### S-05 — Emergency runway

- Inputs: user-entered cash/bank, editable FD principal, optional other explicitly accessible amount, and
  monthly outgoings. Balances are finite and non-negative; outgoings are finite and greater than zero.
- Accessible amount = cash/bank + FD principal + other explicitly accessible amount.
- Runway months = accessible amount / monthly outgoings. Zero accessible amount is valid and returns 0.0.
- Display months to one decimal and rupees to whole units. Reject a non-finite or unsafe sum/output.
- Never auto-include PPF, EPF or RD, infer cash, persist edits, or supply an adequacy target.
- Disclose counted categories and that closure delays/reductions, tax, penalties, changing expenses and returns
  are not modelled.

### S-03 — Increase SIP

- Inputs: current monthly SIP, additional monthly amount, annual rate and years. The annual rate is always
  entered by the user and is never populated from a holding, budget record, benchmark, historical return or
  app default. Any future recorded rate candidate requires a separately approved source contract.
- `n = round(years × 12)` and `r = annual_rate / 12 / 100`.
- Ordinary-annuity future value with end-month contributions is
  `P × ((1+r)^n − 1) / r`; at zero rate it is `P × n`.
- Calculate base with current SIP, raised path with current plus additional SIP, difference as raised minus
  base, and additional invested as additional SIP × n. Display rupees to whole units.
- Reject non-finite inputs/intermediates/outputs. BQ-132 must set safe ceilings and decide whether zero
  additional SIP is a valid equality path; current negative SIP behavior is not approved.

### S-06 — Debt cost

- Inputs: selected eligible balance, annual interest rate and remaining months. Balance is positive, rate is
  non-negative and months are positive; all are finite. Blank, nonnumeric, non-finite, negative, zero and
  out-of-domain periods are invalid. A non-integral value follows O-SC-7 and is never silently transformed.
- With monthly rate `r`, EMI = `P × r × (1+r)^n / ((1+r)^n − 1)`; total payable = EMI × n; total interest =
  total payable − P. Next-year interest is the month-by-month interest for `min(12,n)` months.
- At zero rate, EMI = P/n, total payable = P and both interest outputs are zero. Display rupees whole.
- Reject unsafe/non-finite values. BQ-132 must set ceilings, decide whether months must be an integer or round
  to nearest, and reconcile whether credit-card debt is eligible for this fixed-amortisation model.

### S-07 — Idle-cash comparison

- Inputs are manual cash amount, two user-owned annual rates and years. Amount/years are positive, rates are
  non-negative, and all are finite.
- Each path compounds annually: `A = P × (1 + rate/100)^years`. Difference = alternate path minus savings
  path. Equal (zero) and alternate-lower (negative) results are valid arithmetic.
- Preserve input order and symmetric presentation; never reorder by outcome or call a winner. Display rupees
  whole. Reject unsafe/non-finite values. BQ-132 sets safe ceilings.
- O-SC-1 remains open between “Inaction tax” and “Idle cash over time”; ID/formula stay unchanged.

### S-01 — Time to user-set corpus

- Inputs: current corpus, monthly contribution, annual rate and user-set target. All are finite and
  non-negative; target is positive. The app supplies neither target nor rate.
- Simulate monthly, applying return then an end-month contribution:
  `balance = balance × (1 + annual_rate/1200) + monthly_contribution`.
- Stop on reaching the target or at the existing 720-month horizon. Already reached returns 0 months. With
  zero contribution and zero rate, return “not reached”, not zero.
- Display years as months/12 to one decimal; any optional age is nearest whole year. Guard every iteration
  against non-finite/unsafe values so overflow cannot produce a false reached result. BQ-132 sets ceilings.

### S-02 — Loan prepay vs invest

- Eligible sources are owned home/personal loans only. Backend refetches the selected record and uses stored
  outstanding principal, rate and EMI. Prepayment `X` is strictly `0 < X < P`.
- Hurdle rate equals the stored loan rate; it is not a forecasted investment return. Implied remaining tenure
  is `−log(1 − rP/E) / log(1+r)` under the existing amortisation convention.
- Show both tenure-reduction at same EMI and EMI-reduction at same tenure. Charges are assumed zero and
  disclosed. This is a break-even mechanism, not a projected investment outcome or recommendation.
- Amount/EMI/savings display to two decimals; new months to one decimal. Reject non-positive, non-finite or
  non-amortising stored values and all unsafe outputs.
- BQ-132 must set safety ceilings and decide whether zero-rate loans are supported. Production reconciliation
  must separately consider moving prepayment out of the GET query string to reduce log exposure.

### EX-ESOP — Exercise cost

- Backend refetches the owned ESOP grant. Elapsed whole months use anniversary/month-end clamping.
- Vested units are cliff-gated, then `floor(total_units × elapsed_months / vesting_period_months)`, capped at
  total units. Exercise cost = vested × strike; spread = vested × (FMV − strike).
- Zero units and zero strike are valid. Equal FMV/strike returns zero spread; FMV below strike retains a
  negative spread with neutral “underwater” explanation. Missing FMV is unknown, not zero.
- Cost/spread display to two decimals. Reject negative or non-finite units, price, FMV, cliff/window inputs and
  unsafe outputs. State whether grant timing is recorded or estimated. Response provenance gaps remain BQ-132.

### EX-80C — Unused room

- Old-regime only. Known amount sums owned PPF/EPF annual contributions and recognised-cadence recurring
  term/endowment premiums. Annualisation multipliers: monthly 12, quarterly 4, six-monthly 2, annual 1,
  weekly 52.
- `unused_room = min(₹150,000, max(₹0, ₹150,000 − known_amount))`.
- Negative/non-finite legacy entries and missing/unrecognised cadence are excluded with warnings, never
  treated as zero. Reject unsafe aggregate/output. Display contribution and room to two decimals.
- New regime returns no number. Statutory FY/source/verification/staleness provenance remains absent, so
  external release stays gated; the explorer never recommends a product or contribution.

### EX-TERM — Household-support scenarios

- Every debt, goal, asset offset and other component starts excluded. The user explicitly selects each one;
  recorded candidates are never auto-included. Existing production defaults for debts/goals contradict this
  binding rule and are BQ-133 reconciliation evidence.
- Support years are user-entered integers 1–100. Before running, the user explicitly chooses **Model no annual
  change** (`g = 0`) or **Enter an annual change assumption** (finite `g` in O-SC-4's approved domain); blank
  treatment never becomes zero silently. Support stream is `annual × Σ(1+g)^y`, `y=0..n−1`. Amount ceilings
  follow O-SC-4 and every intermediate/output must stay finite and safely representable.
- Modelled amount = `max(0, support stream + selected debts + selected goals − selected asset offsets −
  selected survivor-income stream)`.
- Entered cover = individual + group + other cover. Signed comparison = entered cover − modelled amount.
  Zero, equal and negative signed results are valid. Existing cover remains separate from asset offsets.
- Guard every intermediate/output; display rupees whole. Dependants are descriptive only and never converted
  into money. Never use required, adequate/inadequate, shortfall/surplus, under/overinsured or purchase copy.

## 6. Authentication, API and account isolation

Protected requests use the bearer token. Backend middleware verifies the subject, removes caller-supplied
`user_id`, and owned services query only that verified subject. Frontend user IDs are non-authoritative.

On account/logout/permission transition, clear candidates, selected records, draft, result, error, consent and
modal state synchronously before fetching the destination. Tag every request with subject plus surface
generation and ignore/cancel late generations. A late prior-account response causes no render, announcement,
focus move, model call or progression event.

The source mapping is binding:

- S-05: `/holdings` for confirmed FD principal only; `/budget` for recurring plus discretionary outgoings.
  Cash/bank and other accessible amounts are manual.
- S-03: `/budget` recurring equity/debt mutual-fund outflows only.
- S-06: `/holdings` eligible loan fields, subject to the BQ-132 credit-card ruling.
- S-07: no account read.
- S-01: `/holdings` for MF/stocks current value, FD principal, PPF/EPF balance; `/budget` for MF SIPs. RD is
  excluded.
- S-02: owned `/holdings` chooser, then read-only `/loan-vs-invest` with server refetch.
- EX-ESOP: read-only `/esop-exercise-cost` with server refetch of an owned ESOP.
- EX-80C: read-only `/tax-saving-room`, with transient regime input.
- EX-TERM: owned holdings/goals supplied from Insurance; optional `/financial-context` only after explicit
  consent. Declining and starting blank remain fully usable.

## 7. Persistence, privacy, model and progression

No draft, inclusion, assumption, result, source error or consent is stored in AsyncStorage, localStorage,
database, cache or analytics. Backend explorer GETs are read-only. Offline work is never queued for later
upload. The controlled prototype uses fixture memory only and makes no API, model, storage or analytics call.

An optional Arya handoff requires a separate confirmation screen showing the exact payload. It uses existing
privacy masking and sends aliases plus characteristics—not names, institutions, identifiers or raw source
records. Cancel makes zero model calls; recovery never silently resends; transcript persistence remains out
of scope.

After a finite valid result has rendered, emit at most one fire-and-forget `scenario_completed` event per
scenario type per local day, with at most two scenario awards across all types per day. The subject key is the
stable type, never a record/name/value/outcome. Emit nothing on open, edit, source load, invalid/stale result,
reset, retry, exit or handoff. Event failure/cap never blocks or changes the result. Focused explorers obey the
same participation-only rule. No stage gates content.

## 8. Content and comparison safety

- Before inputs, state what is calculated, material omissions, source availability and transience.
- Consequential inputs are visibly manual, selected or editable source-labelled candidates. Never use silent
  “typical”, “expected”, “safe”, “affordable”, “adequate”, “optimal” or “recommended” assumptions.
- Results state unit, convention/formula, current-input summary, attribution, rounding/cap and omissions.
  They are conditional arithmetic, not forecasts.
- Use neutral ink and monospaced figures. No financial red/green, arrows, threshold emphasis, celebration or
  success/failure decoration. Teaching prose may use tutor type; figures, labels and actions do not.
- Parallel paths have identical field order, weight, styling and actions and remain in input order. No winner,
  recommendation chip or outcome CTA. Where D-092 comparison structure applies, preserve criteria handback,
  equal columns, order note and named third path.
- Apply D-091's declined-verdict pattern only when a personal figure naturally invites a verdict: name the
  exact verdict not supplied, then provide the available mechanism without apology or legal framing.
- Exits visibly state that nothing was saved. The interface never manufactures urgency or ranks catalogue
  items through order, size, colour or emphasis.

## 9. Failure, offline and recovery

Each source settles independently as loading, complete, empty, partial, failure, stale or malformed. Partial
success keeps good candidates and identifies only the failed source. Network/5xx failure retains only the
subject-scoped manual draft and offers source-local retry. Pure local formulas may run offline only when all
critical inputs are visibly available/manual; S-02, ESOP and 80C cannot create a new result offline.

401/403 means permission loss: clear all financial state and route to reauthentication, never generic retry.
404 for a selected record means deleted/ineligible and returns to chooser. Remote calculation failure retains
the safe draft and exact source, offers retry/back, and never relabels failure as empty. Offline never claims
freshness or later uploads scenario data.

## 10. Accessibility and responsive contract

- One announced heading per screen/modal. Every control exposes role, name, selected/checked/expanded,
  disabled/busy state and a usable hit target. Inputs have persistent programmatic labels including units.
- Loading/source status uses status/live semantics with stable geometry. Field errors are associated and
  summarised as an alert; failed run focuses the first invalid field or linked summary without clearing other
  values.
- A new current result has a named region and one polite identity/unit announcement, then logical focus/scroll
  to its heading. Invalid, stale and superseded results are never announced or rewarded.
- Modal open focuses heading/first task control, traps keyboard focus on web, supports Escape/system back,
  hides the background from assistive technology and restores the exact opener. No nested modals or
  interactive nesting.
- Keyboard/read order is scope, provenance, fields, run, result, secondary actions, exit. All chips, switches,
  retries, choosers and disclosures work without pointer or precision gestures and have visible focus.
- At 200% text/zoom and 320px mobile, content reflows to one column without clipping, overlap, horizontal page
  scroll or offscreen-only close. Stacked comparisons preserve path headings/order. Wide layouts cap line
  length without changing hierarchy.
- Light, dark and high-contrast themes preserve meaning and contrast. Reduced motion removes nonessential
  transitions; motion is never required to understand state.

## 11. BQ-132 owner-decision register seed

The next gate must resolve or explicitly park these forks before prototype build:

1. O-SC-1: final S-07 user-facing name.
2. O-SC-4: complete numeric domains and reject-before-render behavior.
3. O-SC-5: whether S-03 accepts zero additional SIP as equality.
4. O-SC-6: whether S-02 supports zero-rate loans.
5. O-SC-7: S-06 integer periods and home/personal-versus-credit-card eligibility.
6. O-SC-8/O-SC-9: freshness promise and production privacy/provenance follow-ups.
7. O-SC-10: ESOP date/valuation authority.
8. O-SC-11: 80C statutory version authority (standing external gate).
9. O-SC-12: recorded-candidate default inclusion.
10. O-SC-13: accepted numeric grammar.

D-167 and D-168 have already resolved former O-SC-2/O-SC-3.

EX-80C statutory provenance/external release and EX-TERM counsel review stay gated by their standing decisions;
they are not reopened as prototype design choices.

## 12. BQ-133 evidence minimum

Test every suite entry in initial, loading, partial/empty/failure, invalid, boundary, calculating, current,
changed-input, reset, retry, offline, account-switch and return/close states where applicable. Include zero,
equal, negative signed and crossing outcomes; malformed/non-finite/overflow fixtures; consent decline/accept;
one/many/ineligible records; late responses; event cap/failure; and forbidden storage/network/model evidence.

Run the matrix at 320px, representative phone and wide desktop; 200% zoom/text; keyboard-only and screen
reader; light/dark/high contrast; reduced motion. Record formula/provenance ledger values, focus/announcement,
DOM/console integrity and all remaining production mismatches. A current shipped behavior does not pass merely
because it exists.
