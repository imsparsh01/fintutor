<!-- Generated: 2026-08-11 | Files scanned: 56 frontend files | Token estimate: ~800 -->

# FinTutor — Frontend Codemap

## Authenticated backend calls

`lib/backend.ts` owns `authenticatedFetch()`: it reads the current Supabase session and attaches its access
token as a bearer token. Every user-data API wrapper uses it and no longer sends `user_id` over HTTP. A
`userId` may remain in UI/helper signatures where it keys installation-local state, but it has no backend
ownership authority.

`components/AccountDeletionModal.tsx` is the Home account-control surface: scope and seven-day backup
disclosure → password reauthentication → separate irreversible confirmation. `lib/accountDeletion.ts`
calls the protected deletion endpoint, signs out locally, and clears installation-local account state only
after backend success.

`components/DataExportModal.tsx` is the adjacent account-access control: fresh password reauthentication
then `lib/dataExport.ts` downloads a documented JSON snapshot. Web uses a browser download; native writes
only to Expo's cache, opens the system share/save sheet, and deletes the temporary file afterward.

## Entry: `app/App.tsx` → `app/navigation/RootNavigator.tsx`

## Navigation: `app/navigation/MainTabs.tsx`

D-106: 5 visible tabs (Home · Portfolio · Goals · Tools · Chat). D-113 adds matching code-native icons
via `components/TabIcon.tsx`; hidden destinations set both a null tab button and `display: none` item style,
so they remain navigable without reserving visible tab-bar width.
CalculatorScreen is also a hidden tab, entered from ToolsScreen via `{ type: CalculatorType; label }`.
ScenarioScreen follows the same pattern via `{ type: ScenarioType; label }` (BQ-056).

Calculator numeric engines: `lib/calculatorEngines.ts` owns SIP Goal, Home Loan EMI, Inflation Impact and
CAGR exact D-174 domains/zero/fraction branches; `lib/stepUpSip.ts` owns bounded Step-up timing. The screen
uses `parseScenarioNumber()` as the shared strict whole-string input boundary rather than permissive parsing.

Hidden screens use `navigation.navigate('<parent tab>')` for their back control, NOT `goBack()` —
a bottom-tab navigator defaults to `backBehavior: 'firstRoute'`, so `goBack()` lands on Home.

## Screen inventory

```
Screen                  File (lines)               Purpose
──────────────────────────────────────────────────────────────────────────────
NotConfiguredScreen     screens/ (38)              Supabase env vars absent
LoginScreen             screens/ (116)             Email+password auth
RegisterScreen          screens/ (123)             New account
OnboardingScreen        screens/ (~360)            Five-axis normalized assessment v2: 18+ acknowledgement,
                                                   deterministic chips, skip/exit, progress, and neutral optional
                                                   handoff to Arya/Portfolio/Goals/Tools/Home (BQ-076)
VoluntaryAssessmentScreen screens/ (~55)            Hidden Assessment route wrapper: loads/resumes v2 for a legacy
                                                   opt-in, or opens management for handled users (BQ-088)
AssessmentContextScreen screens/                    View/change/clear normalized personalization context through
                                                   D-119's existing endpoints; no raw values or internal metadata
ConsolidatedScreen      screens/ (~390)            Home — 8-section feed: financial picture, tappable
                                                   Portfolio Health grid, Arya, calculators, scenarios,
                                                   Learn, streak/reward, and export/delete account controls
PortfolioScreen         screens/ (~430)            Portfolio tab — allocation donut by record count,
                                                   shared Health Score sub-scores, family nav rows,
                                                   category concentration, trend mechanism panel (BQ-058/061)
HealthScoreScreen       screens/ (~260)            Hidden “Portfolio Health” screen — 0-100 score + 4
                                                   expandable rows; accepts an optional focus route param
GoalsScreen             screens/                   Goals tab — explicit load/failure/retry, live partial goal
                                                   progress with valuation provenance, full versioned edit/delete,
                                                   4 goal-type create cards, insurance and emergency summaries
ToolsScreen             screens/                   Tools tab — 9 calculators + the five approved dedicated
                                                   Scenarios; focused explorers remain contextual (BQ-141)
CalculatorScreen        screens/ (~670)            Hidden tab — 8 manual calculators with strict whole-string
                                                   inputs, typed errors, edit invalidation, reset and frozen
                                                   result evidence; every current valid result has an exact
                                                   confirmed privacy-minimised Arya mechanism handoff;
                                                   Credit-card Payoff is manual-only;
                                                   primary ResultCard emits after a valid result renders
ScenarioScreen          screens/                   Hidden tab — S-05/S-03/S-06/S-07/S-01 with excluded-by-default
                                                   typed candidates, strict input, clean reopen/reset, D-168
                                                   invalidation, frozen accessible results, confirmed Arya handoff
                                                   and stable participation-only progression (BQ-141/BQ-143)
InvestmentsScreen       screens/                   Hidden tab — account-guarded holdings list; partial totals named
LoansScreen             screens/                   Hidden tab — account-guarded loan list; partial totals named
InsuranceScreen         screens/                   Hidden tab — account-guarded policy list; partial totals named
BudgetingScreen         screens/                   Hidden tab — independently recoverable budget/income/goals/
                                                   discretionary/holdings sections; versioned source/category
                                                   edit/delete; invalid cadence opens its correction path
ChatScreen              screens/ (47)              Chat tab — thin wrapper rendering ChatThread
ProgressScreen          screens/                   Hidden BQ-070 learning-progress detail: stage,
                                                   backend-authored bar/gates, awarded-only attribution
LearningReminderScreen  screens/                   Hidden per-user settings: choose/change time, pause,
                                                   disable, and OS-settings recovery after permission denial
HoldingDetailScreen     screens/ (357)             Single holding — edit + ESOP/LoanVsInvest modals
```

## Component inventory

```
Component                   File (lines)       Purpose
──────────────────────────────────────────────────────────────────────────────
ChatThread                  components/        Core chat UI — Arya header, first-entry role/memory scope,
                                               visible model-boundary disclosure, messages, explicit
                                               no-duplicate retry, proposal rendering and reconciliation.
                                               Validated framing is hidden during onboarding (BQ-108).
HoldingProposalCard         components/        Transient reconciliation: visible not-saved provenance,
                                               zero/one/many candidate UX, stored/proposed field diff,
                                               explicit apply/dismiss (BQ-077/BQ-108)
HoldingEditModal            components/        Add/edit/delete/recategorise holding — schema-driven validation,
                                               field-loss review, version conflict reconfirmation, deletion impact,
                                               and reminder-only recovery after an authoritative backend write
GoalFundingFields           components/        Optional neutral holding picker + earmarked amounts;
                                               reused by goal creation and existing-goal link editing
ConsolidatedTotalsCard      components/        Home totals — uses status/count metadata rather than numeric
                                               zero; visibly flags unreadable values and unclassified records
TeachingWalkthrough         components/        Full-screen P9-guarded own-numbers walkthrough. Skip stays live
                                               on every step; nothing unlocks and nothing persists. Shows
                                               source-visible saved figures, explicit unknowns and an optional
                                               D-078-confirmed Chat handoff for only missing details.
TeachingBlock               components/ (46)   Inline teaching paragraph (used inside family screens)
ScenarioHandoffModal        components/        Exact privacy-minimised payload confirmation; cancel is local,
                                               confirm alone hands the mechanism prompt to existing Chat recovery
LoanVsInvestModal           components/        Authenticated S-02 prepayment explorer with strict amount,
                                               current-result invalidation/focus, retry/reset and source evidence
EmergencyCoverageTool      components/          Shared S-05/C-14 editable form; independently loaded budget/FD
                                               component evidence comes from the authenticated Scenario-candidate
                                               API with source/version/field/retrieval metadata; values remain
                                               excluded until explicit inclusion; typed permission/retry recovery,
                                               strict input, reset, frozen evidence, Arya handoff and accessibility
EsopExerciseCostModal       components/        ESOP cost today with generation-safe retry, India-date/
                                               recorded-FMV provenance and accessible current-result focus
TaxSavingRoomModal          components/        Parked internal 80C evidence; no production launcher (BQ-136)
TermInsuranceExplorerModal components/        Consent-first transient component model: every recorded component/
                                               cover starts excluded, growth mode is explicit, provenance is visible,
                                               and edit/reset/reopen lifecycle preserves only a current neutral result
FinancialContextModal      components/        View/change/clear the two optional account-owned context values
PrivacyPolicyModal         components/        Full internal-MVP v1 policy, linked before registration and Home
LearningReminderManager components/           One-time post-learning opt-in offer plus foreground horizon
                                               refresh; never prompts or schedules before explicit opt-in
StreakBadge                 components/ (32)   Streak counter — behaviour color only (P7)
TabIcon                     components/ (~180) Five code-native primary-nav glyphs; no icon dependency
[Mascot deleted — BQ-053]
```

## lib/ — API and state

```
File                    Lines   Purpose
────────────────────────────────────────────────────────────────────────────
backend.ts              17      Shared base URL (EXPO_PUBLIC_BACKEND_URL ?? localhost:8000)
dataExport.ts                   Reauthenticated export API + browser download/native temporary share/save
dataExportFormat.ts             Stable dated filename and readable newline-terminated JSON formatting
chat.ts                 78      sendChatMessage() — POST /chat wrapper; onboarding fields
chatRetry.ts                    Dependency-free explicit-retry contract: retains only the failed question's
                                send inputs and forbids a duplicate user-message append on retry
apiResponse.ts                  Structured backend error parsing; preserves typed 409 current/proposed payloads
baselineUiState.ts              Pure stale-reconfirm, field-loss, partial-load, reminder and account-generation rules
holdings.ts                     Versioned holding CRUD + owned deletion-impact preview
consolidated.ts                 fetchConsolidated() → family totals/status/counts, including invalid-value
                                counts and a top-level unclassified-record count
budget.ts               24      fetchBudget() → {income, provenance, goals, discretionary, taxRoom}
income.ts                       Stable source IDs; versioned source edit/delete + deletion impact
discretionaryCategories.ts      Versioned category create/edit/delete + deletion impact
goals.ts                        Full versioned goal lifecycle and backend-authored live progress provenance
financialContext.ts             Authenticated view/replace/clear API for confirmed dependant/emergency context
onboarding.ts           17      Legacy device-local completion helpers (retained for BQ-068 compatibility)
onboardingAssessment.ts ~130    Dedicated v2 normalized API client + handled-state outage cache,
                                legacy-presence compatibility read, local invite dismissal, and handled-context
                                update/clear calls (BQ-088)
assessmentVocabulary.ts         Shared approved normalized codes and user-facing labels for capture + management
reminderSchedule.ts             Pure selected-day extraction + next-occurrence calendar arithmetic. Each
                                month independently clamps to its final day, then later months restore the
                                original 1–31 selection; Expo-free and tested under `node --test`.
reminders.ts                    Expo local credit-card/EMI reminders. Maintains six dated one-shot occurrences,
                                refreshes the rolling horizon on authenticated foreground/edit, migrates old
                                single-ID storage, and never requests permission during background refresh.
learningReminderSchedule.ts     Pure next-seven-days local-time arithmetic and deterministic rotation across
                                generic behavior-only notification copy; tested without Expo imports
learningReminders.ts            Per-user opt-in/preference state and isolated Expo one-shot scheduler;
                                supports change, pause, disable and denial-without-renag behavior
streaks.ts              32      fetchStreak / recordAppOpen
progression.ts          ~95     BQ-071 emitters: recordCalculatorCompleted / recordScenarioCompleted,
                                plus fetchProgression(). Every emitter is fire-and-forget and swallows
                                its own failures — a ledger outage must never surface on a screen the
                                user came to for an answer. Keys use the fixed Asia/Kolkata ledger day;
                                each completion asks the backend to couple its first-capability award.
                                Result effects emit only after a valid result commits to the screen; BQ-143
                                covers all eligible dedicated/focused Scenario types with type-only keys.
                                These live in the app because calculators and scenarios compute client-side.
                                BQ-070 also fetches the backend-authored summary/history projections.
characteristicsSchema.ts 94     CHARACTERISTICS_SCHEMA — per-product-type field definitions for HoldingEditModal
walkthroughSteps.ts             Pure per-family plan builder: selects only mechanism-relevant saved fields,
                                preserves real zeroes, labels provenance, and never fabricates unknown values
rewardFacts.ts          9       Curated mechanism-fact array for app-open reward surface (D-100)
taxSavingRoom.ts        24      Parked client for internal 80C evidence; unreachable in production (BQ-136)
loanVsInvest.ts                 Authenticated POST-body client + typed authoritative source evidence
esopExerciseCost.ts             Typed India-date/recorded-FMV result + authoritative source evidence client
scenarioCandidates.ts           Typed authenticated four-group component/provenance client; BQ-141 consumes it
scenarioSession.ts              Pure excluded candidate draft, untouched/edited refresh, reset, total,
                                strict eligible-loan evidence and permission/retry classification lifecycle
scenarioHandoff.ts              Pure stable-type/normalized-input mechanism prompt builder; rejects names,
                                aliases, institutions, source/record identifiers and non-finite values
holdingReconciliation.ts       Resolve owned candidate/new choice and apply confirmed transient diff;
                                exposes refreshed proposal on stale 409
compoundGrowth.ts              Pure D-128/D-129 month-end contribution model with finite/safe bounds;
                                typed validation/overflow reasons, zero-rate branch, arithmetic difference
goalAffordability.ts           D-145 pure month-end goal-gap model: ending value, required monthly
                                contribution and signed planned-minus-required gap with bounded validation
creditCardPayoff.ts            Pure fixed-payment month loop: interest then clamped month-end payment;
                                paid/non-clearing/1200-cap/typed-invalid outcomes
                                Calculator UI clears all card inputs/results on auth-user change; any
                                manual edit invalidates the displayed outcome until recalculation.
stepUpSip.ts                   D-129 pure month-end contribution loop; annual step-up starts with the
                                first contribution of each new 12-month block
emergencyCoverage.ts           Shared D-130 pure accessible-balances / monthly-outgoings calculation and
                               liquidity-narrow budget/fixed-deposit prefill helpers; retirement excluded;
                               BQ-137 rejects unsafe/non-finite aggregate and quotient before result
scenarioNumbers.ts             D-170 strict whole-string plain/Indian/international numeric parser with
                               normalized value plus shared ₹1-quadrillion output guard; UI wiring is BQ-141
termInsurance.ts               Pure D-145 support-stream/component model and excluded-by-default source-visible
                               recorded-context projection; no inferred rate, persisted scenario, advice or reward
requestGeneration.ts           Tiny stale-async guard used when consented modal context requests outlive UI state
esopExerciseCost.ts     26      fetchEsopExerciseCost()
healthScore.ts          ~135    computeSubScores(budget,holdings,months,hasHealthIns) → {investmentRate,insurance,emergency,taxUtil}
                                computeOverall(scores) → {score,measured}; pure functions, no side effects
                                80C (taxUtil) reads ppf_epf.annual_contribution + annualised insurance premium.
                                D-112: cadence handling matches tax_saving_room.py — missing/unknown is
                                excluded; recognised six-month variants annualise as two payments.
concentration.ts        55      computeCategoryConcentration(holdings) → {totalFunds, categories[], largest}.
                                BQ-061 — counts of equity vs debt MFs. Counts only, never a rupee figure
                                (D-106 rules that out: a by-value share reads as a weighting verdict).
healthScoreSnapshot.ts  ~85     BQ-058/D-110 lightweight shared computed snapshot. Portfolio refreshes;
                                HealthScore reuses; in-flight loads deduplicated; local answers recompute cache.
scenarios.ts            ~300    BQ-056/BQ-137 pure Scenario maths — derivePrefills plus sipIncrease / debtCost /
                                idleCashOpportunity / monthsToTarget. D-171 exact amount/rate/period/output
                                domains guard every input, intermediate and result; S-06 accepts only integer
                                months and home/personal candidates; S-01 guards overflow before target reach.
                                Every rate remains a caller-supplied user input.
format.ts               3       Currency formatting util
taxonomy.ts             45      Product-type → family mapping (investments / loans / insurance)
discretionaryCategories.ts 33   fetchCategories / createCategory
AuthContext.tsx         26      userId + displayName via React context
supabase.ts             21      Supabase client init; isSupabaseConfigured flag
```

## design/

```
tokens.ts (103)      colors, font, spacing, radius, figure — the warm-ledger token set (D-086).
                     Key constraint: P10 — no valence colour; P11 — font.tutor for teaching copy only.
typography.ts (49)   Predefined TextStyle combos (headingLg, bodyTutor, mono, etc.) built from tokens.
```

## Holding taxonomy (D-013)

```
Investments: equity_mutual_fund | debt_mutual_fund | stocks | fd_rd | ppf_epf | esop
Loans:       home_loan | personal_loan | credit_card_debt
Insurance:   term_insurance | endowment_ulip
```

## Calculator types (D-105/D-106, BQ-057)

```
CalculatorType (navigation/types.ts):
  'sip_goal'       C-04 — SIP Goal Planner (target → monthly SIP)
  'emi'            C-10 — Home Loan EMI
  'inflation'      C-17 — Inflation Impact
  'stepup_sip'     C-22 — Step-up SIP Corpus
  'cagr_backward'  C-24 — CAGR Calculator
  'compound_growth' D-128 — lump sum + month-end contributions at a user-entered rate
  'credit_card_payoff' D-128 — optional recorded-card prefill + user-entered fixed payment model
  'emergency_coverage' D-128/D-130 — shared accessible-balances runway mechanism (C-14)
  'goal_affordability' D-145 — neutral modeled ending value, required contribution and signed gap
```
All 9 are pure frontend math. Tax/HRA remain blocked pending a separate rule-source contract.

## Scenario types (D-106, BQ-056)

```
ScenarioType (navigation/types.ts):
  'emergency_runway'  S-05 — shared D-130 accessible-balances coverage mechanism
  'sip_increase'      S-03 — corpus difference from an extra monthly amount
  'debt_cost'         S-06 — interest inside the remaining repayments
  'idle_cash'         S-07 — a cash balance compounded at two user-set rates
  'corpus_target'     S-01 — years until the corpus reaches a user-set target
```
S-04 (rent vs buy) parked — needs schema fields. S-02 (prepay vs invest) is LoanVsInvestModal (D-014),
launched contextually from an eligible owned home/personal-loan detail; it is not duplicated in Tools.

## Key patterns

- All screens call backend lib functions (not fetch directly).
- `HoldingEditModal` is driven entirely by `CHARACTERISTICS_SCHEMA[product_type]` — adding a new type only
  requires adding an entry there.
- `TeachingWalkthrough` is reused by all three family screens; steps come from `walkthroughSteps.ts`.
- New-user onboarding v2 never uses `ChatThread` or `/chat`. `RootNavigator` reads backend-authoritative
  assessment state and only falls back to a locally cached handled state during a backend outage. The
  handled-state handoff offers equal existing-route choices; cache writes are best-effort and never gate access.
  old legacy row is read only for presence: any row grants cross-device access without inferring v2 axes.
  Home offers those users one locally dismissible opt-in route to `VoluntaryAssessmentScreen`.
- `CalculatorScreen` receives `{ type: CalculatorType; label: string }` as route params and renders the
  appropriate calculator. ToolsScreen is the only entry point (hidden tab pattern). Shared calculator
  inputs/buttons expose labels, hints, roles and disabled state; a valid ResultCard announces and receives
  accessibility focus after render on native, which is also the completion-emission boundary. Web retains
  the semantic heading and announcement but never calls React Native's native-only `findNodeHandle` path.
- **AsyncStorage keys `hs_emergency_months` / `hs_has_health_ins`** are written by HealthScoreScreen and
  read by both HealthScoreScreen and GoalsScreen. One answer, two surfaces — do not add a second prompt
  for either question. No vector-icon library is installed: GoalsScreen's goal-type marks are drawn from
  plain Views (rotated squares, a CSS-triangle roof, bordered circles).
- **The focused 80C room explorer is production-unreachable (BQ-136/D-170).** Its component/client and pure
  backend service/tests remain parked internal evidence, but Budget has no launcher and FastAPI registers no
  `/tax-saving-room` route. Re-release requires a named financial year, official sources, verification
  owner/date, stale shutdown and qualified India review. `healthScore.ts` still contains Portfolio Health's
  separate legacy tax-utilisation mechanism; BQ-136 does not reinterpret that owner-validated workstream.
