# Scenario and focused-explorer journey and complete state matrix

## End-to-end journey

1. **Discover:** user enters Tools or a relevant holding/budget/insurance context and sees a factual question,
   not a promoted financial action.
2. **Choose:** user deliberately opens one scenario/explorer; no tool opens because the app inferred urgency.
3. **Scope:** the screen states what it calculates, what it will not decide, and whether it can offer recorded
   candidates.
4. **Resolve sources:** account-owned candidates load independently behind neutral source states; prior-account
   content is already absent.
5. **Review provenance:** each candidate names its record/context source and freshness before inclusion.
6. **Author assumptions:** user includes, excludes or edits every consequential amount, rate, horizon, target
   and offset. Unknown remains explicit.
7. **Run:** finite validated inputs enter one named formula; no hidden default or model call contributes.
8. **Read:** result shows unit, current input summary, component/path breakdown, limitations and declined
   verdict. Equal or crossing results remain neutral.
9. **Change:** editing a dependent input immediately enters the owner-approved changed-input state; the user
   deliberately reruns to create a current result.
10. **Explore or return:** user may reset, inspect a source, learn the mechanism, ask Arya through an explicit
    handoff or return to Tools/origin. No financial action or disclosure is required.
11. **Recover:** failed/stale sources retry locally; manual entry remains possible when safe; a lost result is
    recomputed from visible inputs rather than recovered from hidden state.
12. **Exit/switch:** close, logout, permission loss or account change clears candidates, drafts, results and
    modals; late responses are discarded.

## Scenario-specific branches

### S-05 Emergency runway

User confirms cash/bank, editable FD principal, optional personally known accessible amount and monthly
outgoings. The result names counted categories and exclusions. Retirement/RD is never automatically included;
FD closure, delay, tax, penalty, changing expenses and returns remain unmodeled.

### S-03 Increase my SIP

User reviews current monthly SIP candidate, enters extra monthly amount, rate and horizon, then compares base
and raised end values plus extra contributed principal. The order does not imply that increasing is preferred.

### S-06 Debt cost

User selects/reviews one loan’s outstanding, rate and remaining months. Result separates principal, modeled
interest, EMI and next-year interest. No repay/refinance/invest instruction follows.

### S-07 Idle cash over time

User enters one amount plus two rates and a horizon. Both paths receive equal visual treatment; a negative,
positive or zero signed difference is allowed. The final label remains O-SC-1.

### S-01 Time to corpus

User reviews current corpus/contribution, supplies rate and their own target. Result is already reached, a
month/year estimate, or not reached within the explicit 60-year cap. The app never invents the target.

### S-02 Prepay versus invest

User chooses one eligible recorded loan, an amount and user-owned assumptions. The explorer shows transparent
path arithmetic without selecting prepayment or investing. Zero/one/many eligible-loan and fetch-retry paths
remain usable and account-scoped.

### EX-ESOP exercise cost

User opens from an eligible ESOP option record and sees recorded units/strike/FMV provenance. Result explains
cash exercise cost and paper spread while excluding unmodeled tax, fees, vesting and actual grant controls.

### EX-80C unused room

User opens from Budgeting, selects the relevant regime context and reviews included eligible contributions.
Invalid/unrecognized sources are excluded with warning. Output is clamped recorded room, never a tax-saving
recommendation; tax/HRA calculators remain deferred.

### EX-TERM household support

After explicit consent, user selects/edits every support stream, debt, goal, asset, income offset and cover
component. Critical unknowns block calculation. Output is a component sum plus signed entered-cover difference,
never “required,” “adequate,” “shortfall” or “surplus.” All edits are transient.

## Complete state matrix

| ID | State | What appears | Available action | Must never happen |
|---|---|---|---|---|
| SC-01 | Suite loading | Tools structure and shape-matched rows | Wait/back | Empty catalogue flash |
| SC-02 | Suite ready | Calculators, scenarios and contextual-explorer discovery under O-SC-2 | Open one tool | Implied priority or recommendation |
| SC-03 | Deferred item | Explicit unavailable/deferred boundary where referenced | Return/read why | Disabled tool presented as shipped |
| SC-04 | Scenario initial | Question, scope, no result, manual fields | Enter assumptions/back | Default rate/target or automatic run |
| SC-05 | Sources loading | Stable fields with named loading provenance | Manual entry where safe/back | Zero prefill or stale account flash |
| SC-06 | Sources complete | Editable candidates with record/source/freshness | Include/edit/exclude | Candidate silently locked/included |
| SC-07 | Sources partial | Successful candidates plus named unavailable source | Continue manually/retry failed source | Partial presented as complete |
| SC-08 | Sources failed | Source-specific unavailable state; manual route remains | Retry/manual/back | Treat failure as no holdings/budget |
| SC-09 | No source records | Neutral “nothing recorded to offer” | Enter manually/leave | Confirm real-world absence |
| SC-10 | Source stale | Last-known candidate and timestamp | Edit knowingly/retry | Present as current |
| SC-11 | Candidate edited | User value replaces offered candidate for this draft | Continue/reset to recorded | Write back silently |
| SC-12 | Candidate excluded | Named component stays visible as excluded | Re-include/continue | Count excluded amount |
| SC-13 | Critical unknown | Exact missing field blocks honest calculation | Enter/leave | Infer or coerce zero |
| SC-14 | Invalid input | Field-level finite/range message | Correct/back | Compute, reward or clear unrelated fields |
| SC-15 | Overflow/cap | Honest bounded error or explicit horizon cap result | Change inputs/back | Infinity, NaN or fabricated precision |
| SC-16 | Ready to run | All accepted current inputs and user-owned assumptions | Run/reset/back | Auto-run from saved data |
| SC-17 | Computing | Stable input summary and local progress state | Wait/cancel where applicable | Duplicate run/reward |
| SC-18 | Single result | Unit, current inputs, mechanism, sources and limits | Edit/rerun/learn/exit | Verdict, valence or hidden assumption |
| SC-19 | Side-by-side result | Symmetric path values and signed arithmetic difference | Inspect either path/edit/rerun | Winner, preferred ordering or CTA |
| SC-20 | Equal result | Equality stated factually | Edit/rerun/leave | Tie-break recommendation |
| SC-21 | Crossing/negative difference | Signed result and direction explained arithmetically | Inspect assumptions | Red/green or loss/opportunity judgment |
| SC-22 | Target already reached | Zero time with explicit current≥target explanation | Edit target/leave | Celebration or financial outcome reward |
| SC-23 | Target not reached by cap | Explicit 60-year boundary and “not on these inputs” | Edit/rerun | Infinite loop or impossible certainty |
| SC-24 | Inputs changed after result | O-SC-3 changed-input state | Rerun/reset/exit | Old result looks current |
| SC-25 | Reset | Manual/default-empty draft restored; recorded candidates remain offered separately | Start again/exit | Persistent deletion or write-back |
| SC-26 | Source refresh changes candidate | Current recorded candidate and prior draft distinction | Accept new/keep manual/review | Overwrite touched field silently |
| SC-27 | Source retry succeeds | Repaired source replaces only unavailable/stale candidate | Continue | Duplicate/reordered components |
| SC-28 | Network/5xx | Unavailable source/result request with local draft retained safely | Retry/back/manual where valid | Empty, permission or conflict copy |
| SC-29 | Offline with scoped draft | Explicit offline state and current transient manual inputs | Continue pure local formula/leave | Claim source freshness or silently resend |
| SC-30 | Offline without source | Manual-only/teaching state | Enter manually/reconnect/leave | Fabricated candidates |
| SC-31 | Permission loss | All candidates/drafts/results/modals clear; reauth recovery | Sign in again/leave | Financial residue behind banner |
| SC-32 | Account transition | Destination-account shell only | Wait/cancel through auth | Old-account input/result flash |
| SC-33 | Late prior response | No visual change; discard recorded in fixture evidence | Continue | Old response wins |
| SC-34 | Focused explorer ineligible | Reason and relevant return route | Back/inspect record | Change record or suggest product |
| SC-35 | Zero eligible loans | Neutral no-record state | Add through normal flow/back | Create/guess loan |
| SC-36 | One eligible loan | Selected record provenance before explorer | Open/cancel | Hidden selection |
| SC-37 | Many eligible loans | Named chooser with equal rows | Select one/cancel | App chooses “best” loan |
| SC-38 | Explorer consent | Data-use/source summary before term-context load | Agree/decline/close | Load/use sensitive context before consent |
| SC-39 | Explorer transient completion | Result plus “not saved to baseline” boundary | Edit/close/explicit handoff | Persist scenario or update Health/goals |
| SC-40 | Modal dismissed/reopened | Fresh safe initial state and opener focus restoration | Start again | Prior draft/account leak |
| SC-41 | Optional Arya handoff | Exact visible inputs offered for explicit handoff | Confirm/cancel | Automatic model call or real-name leakage |
| SC-42 | Progression success | Behavior-only participation event after valid result | Continue | Amount/outcome-dependent points |
| SC-43 | Progression failure/cap | Result remains usable; no duplicate/extra reward | Continue | Block result or pressure retry |
| SC-44 | Loading accessibility | Status semantics and stable field shape | Wait/back | Spinner-only meaning or layout shift |
| SC-45 | Error accessibility | Associated inline errors/alerts and focus | Correct/retry/back | Lost focus or color-only error |
| SC-46 | Result accessibility | Named result/live announcement and logical focus | Read/edit/rerun | Silent result below viewport |
| SC-47 | Keyboard/modal | Visual-order controls, trapped modal focus, Escape and restored opener | Complete/cancel | Nested controls or focus escape |
| SC-48 | Mobile/zoom | Single-column reflow, visible units/actions, no horizontal page scroll | Complete all paths | Clipping or precision gesture |
| SC-49 | Theme/reduced motion | Same semantics/contrast; non-essential motion disabled | Complete all paths | Financial valence by theme/motion |
| SC-50 | Exit/return | Correct Tools/origin destination and cleared transient draft | Reopen deliberately | Hidden persistence or wrong tab |

## Controlled prototype fixture families

- **Aarav, complete:** valid budget, multiple holdings and complete candidate context across every explorer.
- **Mira, partial:** one malformed value, one unavailable source, multiple eligible loans, touched manual fields
  and equal/crossing comparison cases.
- **Kabir, empty:** no recorded candidates; all safe manual/teaching paths remain available.
- **Meera, transition:** distinct sparse records used to prove request-generation and account isolation.
- **Boundary fixtures:** zero rate, equal paths, cap-not-reached, invalid, overflow, source failure, stale/offline,
  permission loss, progression cap/failure and late response.

All identities, records and amounts are hypothetical, held only in fixture memory and never sent or stored.

## BQ-130 open reconciliation items

1. O-SC-1 name for S-07.
2. O-SC-2 suite taxonomy/discovery for focused explorers.
3. O-SC-3 changed-input result treatment.
4. BQ-131 must reconcile exact formulas, units, rounding, finite/range guards, API/source contracts, privacy,
   accessibility, progression and failure semantics without silently repairing production.
