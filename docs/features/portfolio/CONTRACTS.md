# Portfolio functional, data, content and safety contracts

**Status:** BQ-126 complete. Four explicit owner forks remain held for BQ-127; this document does not select
a Portfolio Health formula, partial-score rule, optional-context persistence rule or score-band treatment.

## 1. Actors, authority and trust boundary

| Actor / layer | May do | Must not do |
|---|---|---|
| Verified user | View, add, inspect, edit, recategorize and delete their own records; choose teaching routes; provide/clear optional context | Select another subject by sending an ID; be forced to disclose or act |
| App | Request subject-owned records, render derived views, maintain short-lived subject-scoped presentation state, send explicit user intents | Invent values, treat fetch failure as empty, reuse prior-subject data, call a model directly |
| FastAPI | Derive subject from verified JWT, authorize every record, return holdings/totals/context, validate and version writes | Trust caller `user_id`, expose another subject, send display names to the model |
| Database | Persist owned holdings/context and version tokens; enforce ownership-adjacent integrity | Calculate financial judgments or grant client table access |
| Arya/model boundary | Receive approved aliases/characteristics after explicit handoff | Receive real display names, raw identifiers or unseen Portfolio state |
| Fixture prototype | Simulate every approved state using in-memory controlled data | Call network/model/analytics, use durable browser/device storage, mutate production logic |

The verified JWT subject is the sole ownership authority. A `userId` retained in a frontend signature may key
subject-local state but cannot select backend ownership.

## 2. Source and unit contract

Every displayed figure has five inspectable properties: **label, unit, source, inclusion boundary and
freshness**. If any property is unavailable, the interface says so instead of implying precision.

| View | Unit | Authoritative source | Included | Explicitly not represented |
|---|---|---|---|---|
| Investment family total | Rupees | `/consolidated` | Recognized finite valuation field per approved type; FD/RD reads recorded principal/monthly amount as-is | Accrued FD value, ESOP value, unknown/invalid/unclassified records |
| Loan family total | Rupees outstanding | `/consolidated` | Recognized finite outstanding balances | Netting against investments or repayment recommendation |
| Insurance family total | Rupees of recorded fund value | `/consolidated` | Endowment/ULIP current fund value only | Term cover, premium, benefit adequacy or protection value |
| Family record count | Records | Consolidated metadata / owned holdings | Every classified record in that family, including excluded/unvalued records | Rupee weight or quality |
| Portfolio allocation | Records | Owned holdings | Classified Investments/Loans/Insurance records, one count each | Rupee allocation, asset mix, risk weighting or net worth |
| Category concentration | Funds | Owned equity/debt mutual-fund records | Broad supported mutual-fund categories | Hybrid category absent from taxonomy; scheme/stock overlap; rupee weighting |
| Portfolio Health lever | Points out of 100 | Approved formula plus named owned/confirmed inputs | Only inputs the formula explicitly accepts | Suitability, performance, completeness, personal health or recommended action |
| Overall Portfolio Health | Points plus measured denominator | Four lever outputs under owner-approved partial rule | Only as permitted by the BQ-127 ruling | A grade, wealth score, priority or prediction |
| Trend teaching | No financial result | Static approved explanation | Requirement for comparable snapshots | Any chart, return, benchmark or inferred history |

### Status vocabulary

- `empty`: no classified records in the family.
- `valued`: every non-excluded family record has a recognized finite valuation.
- `unvalued`: records exist but none has a recognized value.
- `mixed`: at least one record is valued and at least one active record is unvalued or invalid.
- `excluded`: every family record is deliberately outside the approved total formula.
- `invalid`: a valuation field is present but malformed/non-finite; it is counted separately, never coerced.
- `unclassified`: the product type does not map to an approved MVP family; the record remains visible for
  review and contributes to no family total.
- `unavailable`: the source did not resolve. It is a failure state, never `empty` or zero.
- `stale`: a last-known value is shown with its source timestamp after freshness could not be established.

Zero is displayed only when the authoritative data proves a real numeric zero under a valid calculation.

## 3. Portfolio overview contract

- Account identity and freshness appear before financial content.
- The overview keeps Investments, Loans and Insurance equally reachable regardless of record count.
- No client or prototype subtracts loan totals from investment/insurance totals or labels the result net worth.
- Allocation always says “by records, not rupee value” adjacent to the visualization and exposes the same
  data as text. Each included record counts exactly once.
- Family routes retain their position across empty, partial and failed states; ordering is information
  architecture, not a recommendation or implied urgency.
- Portfolio Health identifies its measured denominator and exposes all four levers. Unknown levers never
  render zero.
- Category concentration uses only equity/debt mutual-fund counts, names its denominator, and shows the same
  “what this shows / cannot tell” limitation in empty and populated states.
- The trend surface states that one balance cannot establish a trend and offers no fabricated graph.
- A section-specific failure leaves all independently successful sections available.

## 4. Persistent family contract

### Reachability and empty states

- Investments, Loans and Insurance are available from Portfolio even with no records (P8/D-076).
- Empty copy explains mechanism/category differences without product/security names, deficiency framing or a
  purchase action.
- The static walkthrough is optional, dismissible and never claims to use personal numbers when none exist.
- The final walkthrough step may offer an explicit Arya handoff. “I think I have one” may start confirmed
  capture. Manual add remains visible and secondary.
- Dismissal, walkthrough skip and leaving the family persist no financial record.

### Populated lists

- Every owned classified record appears, including unvalued and invalid records.
- User-facing title uses the local display name when present and the generated alias otherwise. Internal IDs,
  raw codes, timestamps and version tokens do not appear as primary content.
- Each row names the humanized type and a relevant recorded field only when its value is known and valid.
- Family totals use consolidated status/count metadata; a record list is never filtered to make a partial
  family look fully valued.
- A tap opens the exact owned record. A missing/deleted record returns a neutral not-found/reload state rather
  than another record or a blank edit form.

## 5. Holding inspection and management contract

- Holding detail shows saved characteristics with human labels, units and explicit unknowns. It distinguishes
  recorded facts from computed teaching output.
- Real display names remain visible to the authenticated user but are replaced by aliases before any Arya/model
  call. The handoff sends a server-resolvable owned alias, never the display name as model context.
- Create requires an approved family-scoped product type and confirmed fields. The backend generates the alias
  when the manual flow omits one.
- Edit starts from the latest authoritative record. Draft fields are visually and semantically distinct from
  saved fields; cancel writes nothing.
- Recategorization previews fields that will be dropped or become inapplicable before confirmation.
- Ordinary update sends `expected_version`; a mismatch displays authoritative versus proposed values and
  requires explicit reconfirmation or revision. No automatic last-write-wins.
- Delete first loads neutral impact: record label, linked goals, funding links/reminders and affected computed
  views. A separate destructive confirmation sends the authoritative version.
- Delete removes the owned record and approved dependent links only as declared. It does not claim the user
  changed their real-world financial position.
- If a record write succeeds but reminder maintenance fails, the record remains authoritative and reminder
  recovery is separate/non-blocking. Retry cannot duplicate the record or write.

## 6. Portfolio Health contract

### Stable rules

- The visible name is “Portfolio Health.” It refers to four defined recorded-data mechanisms, not general
  financial health, personal worth, investment quality or performance.
- The four levers remain Investment rate, Insurance, Emergency buffer and Tax utilisation.
- Each lever exposes: current measured/unknown state, unit, plain-language mechanism, exact accepted sources,
  formula boundary, missing inputs and user-controlled correction/context route.
- Null/unavailable is not zero. An API failure is not the user having no input.
- All points use neutral ink and identical structural treatment. No green/red, pass/fail icon, celebration,
  urgency or “improve/fix” language derives from the score.
- Updating or clearing a source may change a displayed lever; the interface says “recalculated from the saved
  inputs,” not that the portfolio improved or worsened.
- Opening, viewing or changing Portfolio Health emits no financial-outcome/progression reward.

### Held owner forks

The prototype cannot harden these until BQ-127 records the owner's decisions:

1. **O-PF-1 — insurance formula:** D-106 formula versus shipped health-first formula.
2. **O-PF-2 — partial overall:** hide the overall until four measured, or show an explicitly partial average
   under a named denominator/rule.
3. **O-PF-3 — health-insurance context:** device-local or account-owned persistence, including cross-device,
   export, deletion, retention and account-switch semantics.
4. **O-PF-4 — score bands:** retain, replace or omit D-106's “Getting started / Building up / On track /
   Strong” labels under the non-judgment contract.

Until ruled, contracts and fixtures may display the competing paths for decision but cannot call one current.

## 7. Optional context and privacy contract

- Emergency-fund months and health-insurance presence are optional. The UI names storage/use before save and
  offers a route to view/change/clear where persistence exists.
- “Prefer not to answer,” cancel or clear must not reduce access, teaching availability or learning progress.
- No missing context is inferred from holdings, income, goals, onboarding answers or another context field.
- Emergency months is not recomputed from balances. It remains the user's confirmed account-owned value under
  the existing financial-context contract.
- Health-insurance persistence remains O-PF-3. The fixture uses in-memory state only and labels the competing
  behavior rather than pretending persistence is decided.
- Protected responses, caches, drafts and local keys are subject-scoped. Permission loss/logout/account switch
  clears prior-subject presentation immediately; late responses fail closed.
- Export and account deletion include every backend-owned Portfolio record/context required by the final
  decision. Device-local data must be actively cleared under D-155.
- Logs, analytics and errors never include display names, characteristics, amounts, drafts or context answers.

## 8. API and concurrency contract

| Intent | Contract |
|---|---|
| Load holdings | Authenticated GET; returns only verified-subject records with version; 401/403 clears view |
| Load consolidated | Authenticated GET; returns three totals plus status/count/invalid/excluded/unclassified metadata |
| Load budget/context | Authenticated GET; independent failure produces unknown lever, not zero |
| Create holding | Authenticated POST; family type allowlisted by UI; alias generated server-side; 409 is explicit |
| Update holding | Authenticated PATCH with `expected_version`; 409 returns/causes authoritative refresh and reconfirmation |
| Deletion impact | Authenticated GET scoped to exact owned record; no mutation |
| Delete holding | Authenticated DELETE with `expected_version`; impact reviewed first; retry-safe result |
| Context write/clear | Authenticated mutation only for owner-approved account-owned fields; failure keeps prior value |

- Requests carry no ownership-authoritative user ID. Middleware replaces/removes any caller-selected ID with
  the verified JWT subject.
- Every request generation is bound to the current subject and screen instance. A response is applied only if
  both still match.
- Retry is manual unless an existing idempotent read refresh is explicitly triggered by focus. Mutations are
  never silently replayed after ambiguous transport failure.
- A lost mutation response reconciles by reading the authoritative record/version before offering retry.
- 401/403 is permission loss, not offline. 409 is stale conflict, not generic failure. 5xx/network is
  unavailable, not empty. User-facing copy and recovery differ accordingly.

## 9. Failure and recovery contract

| Failure | Preserve | Clear / suppress | Recovery |
|---|---|---|---|
| One read fails | Other successful blocks, navigation and last-known scoped data if labelled | Current claim for failed source | Manual local retry |
| All reads fail online | Account shell and static teaching | All unverified financial values | Retry or sign out |
| Offline with scoped cache | Last-known values with timestamp | Current/fresh claim and mutation CTAs that cannot safely commit | Restore connection, then manual refresh |
| Offline without cache | Static structure/teaching only | Empty/zero/score claims | Reconnect or leave |
| Write validation fails | Draft and authoritative value | Success state | Correct named fields and retry/cancel |
| Write transport fails before known commit | Draft and authoritative value | Saved claim | Retry after status check |
| Response lost after commit | Draft plus ambiguous-state alert | Blind repeat | Fetch authoritative version and reconcile |
| Stale 409 | Proposed draft and fresh authoritative state | Automatic overwrite | Compare, revise, reconfirm or cancel |
| Permission denied | Safe account shell | All financial/context content and drafts | Reauthenticate |
| Account switch | Destination identity/loading shell | Prior subject, dialogs, drafts, cached snapshot | Load destination; discard late prior response |

No recovery path changes hierarchy, duplicates cards/records or sends an analytics/progression event.

## 10. Content and neutrality contract

Use precise nouns: **recorded, known, unknown, unvalued, invalid, excluded, unavailable, last updated,
by record count, rupees recorded, points measured, proposed, saved, recalculated, try again**.

Do not use: **healthy/unhealthy, good/bad, strong/weak** (pending O-PF-4), **optimal, diversified enough,
too concentrated, fix, improve, urgent, priority, recommended, best, on/off track, complete your portfolio,
missing protection, underperforming, should buy/sell/repay/rebalance**.

- Absence is described as “nothing recorded here,” never “you have no…” unless the user explicitly confirmed
  the real-world absence.
- A total says what is known and why it is partial. “₹X known; full family total unavailable” is valid;
  presenting ₹X alone as the family total is not.
- Concentration always pairs observation with limitation; never converts count to advice.
- Score/mechanism copy never tells the user which lever deserves attention. Stable visual order cannot be
  personalized from values.
- Destructive copy describes data and downstream-view effects, not financial consequences in the real world.
- Empty teaching explains categories/mechanisms and ends in user choice; it never markets an instrument.

## 11. Accessibility and responsive contract

- One page-level heading per screen; section headings follow visual order without gaps.
- Every card that navigates is one named control. No nested buttons; inner rows are either independently
  focusable siblings or non-interactive content.
- Allocation and score visuals have equivalent text with exact labels, values, units and denominators. Color,
  position and shape are never the only carrier of family/state.
- Progress/score groups expose accessible names; expandable health rows expose expanded/collapsed state and
  associate mechanism text with the triggering row.
- Loading uses status semantics; ordinary updates use polite live regions; save/conflict/permission failures
  use alerts. Focus moves to the changed heading/result/error, never disappears.
- Dialogs trap focus, identify title/consequence, support Escape/cancel, and restore focus to the opener.
- Every product target is at least 44×44 CSS pixels with visible 3:1 focus indication; text and controls meet
  WCAG AA contrast.
- At 320px and 390px widths, figures and legends stack/reflow with no horizontal page overflow; primary,
  cancel, back and recovery actions remain visible without precision gestures.
- At wide desktop width, financial reading lines remain bounded and relationships are not separated across
  excessive whitespace.
- At 200% text zoom, no fixed-height financial content clips; tables/cards become stacked reading order.
- Reduced-motion mode removes non-essential animation/transition/smooth scrolling. No state or comprehension
  depends on motion, hover, timing or animation completion.
- Light, dark and system themes preserve identical semantics and AA contrast; financial value never changes
  valence by theme.

## 12. Progression, analytics and prototype contract

- Viewing Portfolio, adding/editing/deleting a record, changing context, raising/lowering a score or filling a
  data gap earns no learning/progression event.
- A genuine optional teaching walkthrough may emit only its already-approved teaching event after the
  meaningful interaction; failure is non-fatal and disclosure/financial action is never rewarded.
- The controlled prototype emits no analytics/progression and stores nothing. Its visible fixture ledger is
  evidence only.
- Fixture identities, records and amounts are clearly hypothetical and never reused as real examples or model
  input.
- Static QA must prove no network, model, analytics, cookie, service worker or durable storage API is present.

## 13. Prototype evidence requirements

BQ-128 must make these paths clickable and record evidence:

1. Complete three-family overview and full Portfolio Health.
2. Empty portfolio and every persistent empty-family teaching/capture route.
3. Mixed partial totals with unvalued, invalid, excluded and unclassified records.
4. Family/detail navigation plus edit cancel, validation failure, stale conflict and retry-safe save.
5. Deletion impact cancel, stale conflict, success and post-write reminder-only failure.
6. Allocation-unit, concentration-limit and no-trend comprehension.
7. Partial/unknown Portfolio Health under the BQ-127 ruling, plus context save/fail/clear.
8. Local read failure, stale/offline with and without cache, and scoped retry.
9. Permission loss and account switch during in-flight requests with zero residue.
10. Keyboard/focus/screen-reader semantics, target size, contrast, mobile/wide/zoom, themes, reduced motion,
    every route/control, DOM validity and zero console warnings/errors.
