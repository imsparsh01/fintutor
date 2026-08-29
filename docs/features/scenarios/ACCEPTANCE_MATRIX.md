# Scenario suite acceptance and evidence matrix

**Status:** Candidate for BQ-132. Criteria are complete; Tier-3 rulings in `DECISION_REGISTER.md` remain
owner-gated before prototype implementation.

**Sources:** `PRD.md`, `JOURNEY_AND_STATES.md`, `CONTRACTS.md`, D-009, D-091, D-092, D-106, D-124,
D-128, D-130, D-131, D-132, D-148 and D-166.

Every criterion has a stable ID. BQ-133 must record direct PASS/FAIL evidence for every applicable row;
existence of shipped behavior is not evidence of conformance.

## A. Access, discovery and authorship

| ID | Given / when | Then |
|---|---|---|
| AC-A01 | Tools opens | Five dedicated scenarios appear in stable, equal-order presentation with no urgency, ranking or recommendation |
| AC-A02 | A relevant owned record/context opens | Its focused explorer is available only through deliberate user action and names the bounded mechanism |
| AC-A03 | No eligible record exists | Neutral explanation plus normal back/add/view routes appear; no record is inferred or created |
| AC-A04 | One eligible record exists | Its source is shown before entry; inclusion is not automatic |
| AC-A05 | Many eligible records exist | Equal-order chooser with cancel appears; no default record is selected |
| AC-A06 | Any tool opens | Scope states what is calculated, omitted, transient and not decided before inputs |
| AC-A07 | Any consequential value appears | It is visibly manual, selected, or an editable source-labelled candidate; no hidden app/model default contributes |
| AC-A08 | User exits | Exact origin/opener is restored and copy confirms nothing was saved |

## B. Source, provenance and freshness

| ID | Given / when | Then |
|---|---|---|
| AC-P01 | A source load begins | Stable neutral loading state appears; empty/error does not flash |
| AC-P02 | Independent sources settle differently | Good candidates remain; each failed/empty/malformed/stale source is named separately |
| AC-P03 | A candidate is offered | Source label, field/component evidence, retrieval evidence, available version and editability are visible |
| AC-P04 | Record freshness is unprovable | UI says loaded/retrieved this session and never calls the value current/fresh |
| AC-P05 | A displayed aggregate is offered | Components are enumerated or aggregate-only provenance is explicitly disclosed |
| AC-P06 | Source value is zero | Measured zero remains distinct from missing, unavailable, malformed, stale or excluded |
| AC-P07 | Untouched candidate refreshes | New value may replace it with visible provenance |
| AC-P08 | Touched/manual field refreshes | Draft is never overwritten; accept-new, keep-manual and reset-to-recorded are available |
| AC-P09 | One source retries | Only that source changes; other candidates and manual draft remain |
| AC-P10 | Account/type/generation changes mid-request | Late prior-generation response causes no render, focus, announcement, model call or event |

## C. Result lifecycle and shared validation

| ID | Given / when | Then |
|---|---|---|
| AC-R01 | Inputs are incomplete/invalid | Run is blocked or rejects with associated field errors; no result/event appears |
| AC-R02 | Run begins | Action is idempotently busy and visible input summary is frozen for that run |
| AC-R03 | Any input/intermediate/output is non-finite or beyond approved bounds | Reject before rendering, announcement, handoff or progression |
| AC-R04 | Valid finite calculation completes | Named result region shows units, formula/convention, current-input summary, attribution, rounding and omissions |
| AC-R05 | Result is exactly zero/equal | It renders neutrally as a valid result, not an error or success |
| AC-R06 | Signed comparison is negative/crosses | Sign and input order remain; paths are not reordered, recoloured or labelled winner/loser |
| AC-R07 | A dependent input changes | D-168 removes the old result, shows the neutral rerun state, and prevents announcement, handoff or progress |
| AC-R08 | User reruns | Only the newest current finite result is rendered/announced/reward-eligible |
| AC-R09 | User resets | Draft, inclusions, errors and result clear; recorded values remain only as separately offered candidates |
| AC-R10 | User closes/reopens | Safe initial state returns; no draft, consent, source, error or result survives |

## D. Dedicated-scenario formula evidence

| ID | Given / when | Then |
|---|---|---|
| AC-S05-01 | Emergency runway valid inputs | Accessible = cash/bank + FD principal + explicit other; months = accessible/outgoings, one decimal |
| AC-S05-02 | Accessible amount is zero | Valid 0.0 months renders; outgoings must remain >0 |
| AC-S05-03 | Candidate sources load | Only confirmed FD principal and budget outgoings are offered; PPF/EPF/RD are never auto-included |
| AC-S05-04 | Result renders | Closure delays/reductions, tax, penalties, changing expenses and returns are disclosed as omitted |
| AC-S03-01 | Increase-SIP valid inputs | End-month ordinary-annuity base/raised paths, difference and additional invested match the ledger |
| AC-S03-02 | Annual rate is zero | FV uses `P × n`; no divide-by-zero or hidden fallback |
| AC-S03-03 | Years convert to months | `n = round(years × 12)` is visible and tested at half/crossing boundaries |
| AC-S03-04 | Additional SIP is zero | Behavior matches the explicit BQ-132 ruling; negative SIP is always rejected |
| AC-S06-01 | Debt-cost valid amortising inputs | EMI, total payable, total interest and first `min(12,n)` months' interest match month-by-month evidence |
| AC-S06-02 | Loan rate is zero | EMI = P/n and both interest outputs are zero |
| AC-S06-03 | Months are fractional or debt is credit-card type | Acceptance/normalization follows the explicit BQ-132 ruling and is disclosed |
| AC-S07-01 | Idle-cash valid inputs | Both annual-compounding paths and signed difference match formula and remain in input order |
| AC-S07-02 | Paths are equal or alternate-lower | Zero/negative difference renders neutrally with symmetric styling |
| AC-S07-03 | Catalogue/result renders | Approved O-SC-1 name is used consistently; no “tax,” winner or lost-opportunity verdict leaks unless explicitly approved |
| AC-S01-01 | Corpus valid inputs | Return-then-end-month-contribution simulation reaches target or stops at 720 months |
| AC-S01-02 | Target already reached | Valid 0 months renders |
| AC-S01-03 | Zero contribution and zero rate cannot reach target | Explicit “not reached” renders, not zero/error/infinite loop |
| AC-S01-04 | Any iteration becomes unsafe | Guard stops before a false reached result |

## E. Focused-explorer formula evidence

| ID | Given / when | Then |
|---|---|---|
| AC-E02-01 | Owned home/personal loan selected | Backend refetches verified-subject record; `0 < prepayment < principal` |
| AC-E02-02 | Stored amortisation values valid | Hurdle, implied tenure, same-EMI and same-tenure outputs match backend ledger |
| AC-E02-03 | Loan rate is zero | Behavior matches explicit BQ-132 ruling without fabricated log formula |
| AC-E02-04 | Result renders | Charges-zero assumption and break-even-not-forecast boundary are visible |
| AC-ESOP-01 | Grant timing crosses anniversary/month-end | Whole-month clamping, cliff, floor and total-unit cap match fixtures |
| AC-ESOP-02 | Units/strike are zero or FMV equals/below strike | Valid zero/negative spread states render neutrally; missing FMV stays unknown |
| AC-ESOP-03 | Result renders | Cost/spread use two decimals and grant timing/provenance limitation is visible |
| AC-80C-01 | Old regime selected | Recognised PPF/EPF/premium cadences annualise exactly and room clamps to ₹0..₹150,000 |
| AC-80C-02 | New regime selected | No room number renders |
| AC-80C-03 | Entry/cadence is invalid or unknown | Excluded with warning, never treated as zero |
| AC-80C-04 | Explorer renders | Statutory FY/source/verification/staleness gate is explicit; no tax-saving/product action is advised |
| AC-TERM-01 | Household-support opens | Every debt, goal, offset and cover component starts excluded |
| AC-TERM-02 | Support stream runs | Integer years 1–100, optional 0% growth and geometric stream match ledger |
| AC-TERM-03 | Components are selected | Modelled amount, entered cover and signed comparison match exact chosen components |
| AC-TERM-04 | Signed result is zero/negative/positive | No adequate/inadequate, shortfall/surplus, under/overinsured or purchase wording appears |
| AC-TERM-05 | Optional context is declined | Blank/manual path remains fully usable; no inference or persistence occurs |

## F. Authentication, privacy, persistence and progression

| ID | Given / when | Then |
|---|---|---|
| AC-X01 | Protected request is made | JWT subject is authoritative; caller user ID cannot select ownership |
| AC-X02 | Unowned/deleted/ineligible record requested | Neutral 404/permission treatment reveals no other-subject content |
| AC-X03 | Logout/account switch/permission loss occurs | Candidates, selections, draft, result, errors, consent and modal state clear synchronously |
| AC-X04 | Prototype/static audit runs | No network, model, analytics, cookie, localStorage, AsyncStorage or database API exists |
| AC-X05 | Production behavior is inspected | No scenario draft/result/consent/source state persists or queues offline |
| AC-X06 | Arya handoff selected | Separate confirmation shows exact payload; aliases/characteristics only cross model boundary |
| AC-X07 | Handoff cancelled/recovery occurs | Zero model calls and no silent resend |
| AC-X08 | First current finite result per type/day appears | At most one `scenario_completed` per type/day and two across types/day; subject key contains no financial data |
| AC-X09 | Open/edit/error/stale/reset/retry/exit/handoff occurs | No progression event fires |
| AC-X10 | Event fails/caps | Result and interaction remain unchanged |

## G. Failure, offline and recovery

| ID | Given / when | Then |
|---|---|---|
| AC-F01 | Network/5xx source failure | Safe manual draft remains; source-local retry/back appears; failure is not empty |
| AC-F02 | 401/403 occurs | All financial state clears and reauthentication appears; no generic retry |
| AC-F03 | Selected record returns 404 | User returns to eligible chooser with no stale result |
| AC-F04 | Remote calculation fails | Safe draft/source remain with retry/back; no result/event appears |
| AC-F05 | Device is offline with local formula inputs | Run is allowed only when every critical input is visibly manual/available |
| AC-F06 | Device is offline in S-02/ESOP/80C | No new result is produced |
| AC-F07 | Connection returns | Nothing uploads or refreshes silently; user explicitly retries |
| AC-F08 | Response is lost after remote completion | Retry remains read-only/idempotent and cannot duplicate state/event |

## H. Content, accessibility and responsive behavior

| ID | Given / when | Then |
|---|---|---|
| AC-C01 | Any result/comparison renders | Neutral ink/monospaced figures; no financial red/green, arrows, celebration, urgency or outcome CTA |
| AC-C02 | Parallel paths render | Identical order, weight, styling/actions and user-authored ordering; D-092 criteria/order/third-path rules hold where applicable |
| AC-C03 | Personal figure invites a verdict | D-091 names the declined verdict and supplies mechanism without apology/legal framing |
| AC-C04 | Screen/modal inspected semantically | One heading, named controls/units, selected/expanded/busy state, associated errors and live status are correct |
| AC-C05 | Current result appears | One polite identity/unit announcement and logical focus/scroll; stale/invalid result is never announced |
| AC-C06 | Modal opens/closes | Focus enters/traps/restores; Escape/system back works; background is hidden; no nested modal/control |
| AC-C07 | Keyboard-only test runs | Logical order reaches every action with visible focus and no pointer/precision dependency |
| AC-C08 | 320px/representative phone/wide desktop | One-column reflow where required, bounded reading width, no clipping/overlap/page scroll/dead-end close |
| AC-C09 | 200% text/zoom | Content reflows without fixed-height loss or hidden controls |
| AC-C10 | Light/dark/high-contrast/reduced-motion | Meaning, AA contrast and focus persist; nonessential motion is removed |
| AC-C11 | DOM/console/static audit runs | Zero syntax errors, warnings, duplicate IDs, nested controls, unnamed controls, heading gaps or forbidden APIs |

## I. State and journey traceability

| Source | Acceptance evidence |
|---|---|
| Journey 1–3 Discover/Choose/Scope | AC-A01..A08, AC-C01..C03 |
| Journey 4–6 Resolve/Provenance/Author | AC-P01..P10, AC-A07 |
| Journey 7–9 Run/Read/Change | AC-R01..R10, AC-S*, AC-E* |
| Journey 10–12 Explore/Recover/Exit | AC-X06..X10, AC-F01..F08, AC-A08 |
| SC-01..SC-09 | AC-A01..A08, AC-P01..P05 |
| SC-10..SC-18 | AC-P06..P10, AC-R01..R06 |
| SC-19..SC-27 | AC-R07..R10, AC-F01..F08 |
| SC-28..SC-36 | AC-X01..X10, AC-C01..C06 |
| SC-37..SC-45 | AC-C07..C11 plus every scenario/explorer formula row |
| S-05/S-03/S-06/S-07/S-01 | AC-S05-*, AC-S03-*, AC-S06-*, AC-S07-*, AC-S01-* |
| S-02/EX-ESOP/EX-80C/EX-TERM | AC-E02-*, AC-ESOP-*, AC-80C-*, AC-TERM-* |

### One-to-one complete-state evidence ledger

No state may inherit PASS from a generic shell check. BQ-133 records the named fixture, screenshot/video,
semantic/focus evidence, formula/network/storage/model/event spy as applicable, and console result for each row.

| State | Required direct evidence | Primary acceptance IDs |
|---|---|---|
| SC-01 Suite loading | Shape-matched Tools capture with no empty flash | AC-P01, AC-C04 |
| SC-02 Suite ready | Five dedicated entries and approved contextual discovery | AC-A01..A02 |
| SC-03 Deferred item | Unavailable boundary and return route | AC-A01, AC-C01 |
| SC-04 Scenario initial | Scope/manual fields/no default/no auto-run | AC-A06..A07, AC-R01 |
| SC-05 Sources loading | Named stable source loader/no zero or residue | AC-P01, AC-P10 |
| SC-06 Sources complete | Editable, source-labelled, excluded-by-default candidates | AC-P03, AC-A07 |
| SC-07 Sources partial | Good data retained and exact failed source | AC-P02, AC-F01 |
| SC-08 Sources failed | Failure-not-empty plus manual/retry route | AC-P02, AC-F01 |
| SC-09 No source records | Neutral absent-candidate state, not real-world absence | AC-P06, AC-A03 |
| SC-10 Source stale | Honest retrieval/version evidence; never false current timestamp | AC-P04, AC-P06 |
| SC-11 Candidate edited | Draft attribution and no write-back | AC-P08, AC-X05 |
| SC-12 Candidate excluded | Visible exclusion and arithmetic omission | AC-P06, AC-A07 |
| SC-13 Critical unknown | Exact block; unknown never zero | AC-P06, AC-R01 |
| SC-14 Invalid input | Associated finite/range error and no result/event | AC-R01, AC-X09, AC-C04 |
| SC-15 Overflow/cap | Approved bounded error/cap and no NaN/Infinity | AC-R03, AC-C11 |
| SC-16 Ready to run | Complete visible input snapshot and explicit Run | AC-R01..R02 |
| SC-17 Computing | Busy/idempotent run and stable summary | AC-R02 |
| SC-18 Single result | Current inputs, units, formula, provenance, omissions | AC-R04, AC-C05 |
| SC-19 Side-by-side result | Symmetric ordered paths and signed arithmetic | AC-R06, AC-C02 |
| SC-20 Equal result | Valid factual equality without tie-break | AC-R05, AC-C01 |
| SC-21 Crossing/negative | Signed arithmetic without valence/judgment | AC-R06, AC-C01 |
| SC-22 Target reached | Zero time and current≥target explanation, no celebration | AC-S01-02, AC-C01 |
| SC-23 Target capped | Exact 720-month not-reached result | AC-S01-03..04 |
| SC-24 Inputs changed | Result removed and neutral rerun state | AC-R07 |
| SC-25 Reset | Draft/result cleared; candidate remains separately offered | AC-R09 |
| SC-26 Refresh changes candidate | Accept-new/keep-manual/reset-to-recorded | AC-P07..P08 |
| SC-27 Retry succeeds | Only affected source replaced | AC-P09 |
| SC-28 Network/5xx | Safe draft and precise retry; not empty/permission | AC-F01, AC-F04 |
| SC-29 Offline with draft | Pure local run only; no freshness/resend claim | AC-F05, AC-F07 |
| SC-30 Offline without source | Manual/teaching only; no fabricated candidate | AC-F05..F06 |
| SC-31 Permission loss | Synchronous clear and reauthentication | AC-F02, AC-X03 |
| SC-32 Account transition | Destination shell only | AC-P10, AC-X03 |
| SC-33 Late prior response | Network spy proves discard and zero side effects | AC-P10 |
| SC-34 Explorer ineligible | Reason and return without record mutation/product prompt | AC-A03, AC-F03 |
| SC-35 Zero eligible loans | Neutral normal-flow routes and no guessed loan | AC-E02-01, AC-A03 |
| SC-36 One eligible loan | Provenance before explicit open | AC-A04, AC-E02-01 |
| SC-37 Many eligible loans | Equal chooser/cancel/no best default | AC-A05, AC-E02-01 |
| SC-38 Explorer consent | Data-use summary before load; decline remains usable | AC-TERM-05, AC-X05 |
| SC-39 Explorer completion | Result is transient and no baseline/Health/goal write | AC-X04..X05 |
| SC-40 Modal reopen | Fresh initial state and exact opener restoration | AC-R10, AC-C06 |
| SC-41 Arya handoff | Exact payload confirmation/cancel and masking spy | AC-X06..X07 |
| SC-42 Progression success | In-memory spy proves participation-only capped event | AC-X08..X09 |
| SC-43 Progression failure/cap | Result unchanged; no pressure/duplicate | AC-X10 |
| SC-44 Loading accessibility | Status semantics and stable geometry | AC-C04 |
| SC-45 Error accessibility | Associated alert, summary and first-invalid focus | AC-C04 |
| SC-46 Result accessibility | Named region, one announcement and logical focus | AC-C05 |
| SC-47 Keyboard/modal | Complete keyboard path, trap/Escape/restore | AC-C06..C07 |
| SC-48 Mobile/zoom | 320px/phone/wide/200% evidence per all nine entries | AC-C08..C09 |
| SC-49 Theme/motion | Light/dark/high contrast/reduced motion per all nine | AC-C10 |
| SC-50 Exit/return | Exact destination plus cleared draft on reopen | AC-A08, AC-R10 |

## J. BQ-133 critical prototype tasks

1. Discover all five scenarios and every approved focused-explorer entry/empty/one/many branch.
2. Exercise loading, complete, partial, empty, failure, malformed, stale, refresh and touched-draft conflict.
3. Verify all nine formula ledgers with normal, zero, equality, negative/crossing, boundary and overflow fixtures.
4. Change every dependent input after result, rerun, reset and close/reopen.
5. Exercise 401/403, 404, 5xx, offline with/without safe manual inputs, retry and late cross-account response.
6. Decline/accept optional context and Arya handoff; prove exact payload and zero-call cancellation.
7. Verify progress once/caps/failure and absence for every non-qualifying action/outcome.
8. Run syntax/static/forbidden-API/storage, keyboard, semantics, focus/announcement, contrast/targets/themes,
   reduced motion, 320px/phone/wide and 200% zoom checks.

## K. Owner validation recording contract

BQ-134 records per critical task: completion without coaching; correct explanation of input authorship,
source/freshness and transience; correct formula/omission/unit understanding; recognition that rates are not
forecasts and differences are not verdicts; recovery without dead end or stale/cross-account residue;
confusion/trust surprises; and PASS / REVISE / PARK / ESCALATE. Broad approval cannot replace criterion evidence.
