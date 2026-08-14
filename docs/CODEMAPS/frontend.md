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
GoalsScreen             screens/ (~640)            Goals tab — goal progress rows, 4 goal-type cards with
                                                   inline create form, insurance coverage summary,
                                                   emergency readiness CTA (BQ-059)
ToolsScreen             screens/ (~310)            Tools tab — 8 calculators + scenarios; S-02 loads eligible
                                                   owned loans and reuses LoanVsInvestModal (BQ-075)
CalculatorScreen        screens/ (~580)            Hidden tab — prior 5 + Compound Growth + Credit-card Payoff
                                                   + shared Emergency Coverage;
                                                   primary ResultCard emits after a valid result renders
ScenarioScreen          screens/ (~620)            Hidden tab — 5 "What if…" scenarios: S-05/S-03/S-06/S-07/S-01.
                                                   Prefills inputs from budget+holdings; every field editable.
InvestmentsScreen       screens/ (338)             Hidden tab — holdings list (equity/debt/fd/ppf/stocks)
LoansScreen             screens/ (290)             Hidden tab — holdings list (home_loan/personal_loan/cc)
InsuranceScreen         screens/ (296)             Hidden tab — holdings list (term_insurance/endowment_ulip)
BudgetingScreen         screens/                   Hidden tab — income + goals + discretionary + tax room;
                                                   visibly flags income omitted for invalid cadence
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
ChatThread                  components/ (~470) Core chat UI — Arya header (BQ-055), message list, input,
                                               proposal card rendering, reconciliation status (D-099).
                                               AryaHeader rendered when !onboarding (D-105).
HoldingProposalCard         components/ (~175) Transient reconciliation: zero/one/many candidate UX,
                                               stored/proposed field diff, explicit apply/dismiss (BQ-077)
HoldingEditModal            components/ (326)  Add/edit holding — schema-driven form via characteristicsSchema
GoalFundingFields           components/        Optional neutral holding picker + earmarked amounts;
                                               reused by goal creation and existing-goal link editing
ConsolidatedTotalsCard      components/        Home totals — uses status/count metadata rather than numeric
                                               zero; visibly flags unreadable values and unclassified records
TeachingWalkthrough         components/        Full-screen P9-guarded own-numbers walkthrough. Skip stays live
                                               on every step; nothing unlocks and nothing persists. Shows
                                               source-visible saved figures, explicit unknowns and an optional
                                               D-078-confirmed Chat handoff for only missing details.
TeachingBlock               components/ (46)   Inline teaching paragraph (used inside family screens)
LoanVsInvestModal           components/ (335)  Prepayment vs invest calculator (D-014)
EmergencyCoverageTool      components/          Shared S-05/C-14 editable form, independent fail-open
                                               budget/FD prefills, disclosures, result and accessibility
EsopExerciseCostModal       components/        ESOP cost today + clamped-anniversary estimate disclosure
TaxSavingRoomModal          components/        80C headroom + visible legacy-invalid exclusion warning
TermInsuranceExplorerModal components/        Consent-first transient component model: source-visible
                                               recorded context, critical-input blocking, editable inclusion
                                               and neutral cover difference
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
holdings.ts             74      fetchHoldings / createHolding / updateHolding / deleteHolding
consolidated.ts                 fetchConsolidated() → family totals/status/counts, including invalid-value
                                counts and a top-level unclassified-record count
budget.ts               24      fetchBudget() → {income, provenance, goals, discretionary, taxRoom}
income.ts               53      fetchIncome / saveIncome
goals.ts                        fetchGoals / createGoal / updateGoalFunding
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
                                ResultCard effects emit only after a valid result commits to the screen.
                                These live in the app because calculators and scenarios compute client-side.
                                BQ-070 also fetches the backend-authored summary/history projections.
characteristicsSchema.ts 94     CHARACTERISTICS_SCHEMA — per-product-type field definitions for HoldingEditModal
walkthroughSteps.ts             Pure per-family plan builder: selects only mechanism-relevant saved fields,
                                preserves real zeroes, labels provenance, and never fabricates unknown values
rewardFacts.ts          9       Curated mechanism-fact array for app-open reward surface (D-100)
taxSavingRoom.ts        24      fetchTaxSavingRoom()
loanVsInvest.ts         30      fetchLoanVsInvest()
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
                               liquidity-narrow budget/fixed-deposit prefill helpers; retirement excluded
termInsurance.ts               Pure D-145 support-stream/component model and source-visible recorded-context
                               projection; no inferred rate, persisted scenario, advice or outcome reward
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
scenarios.ts            ~250    BQ-056 scenario maths — derivePrefills(budget,holdings) plus emergencyRunway /
                                sipIncrease / debtCost / idleCashOpportunity / monthsToTarget. Pure; every rate
                                is a caller-supplied user input (the app never asserts a return rate).
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
launched from Tools with direct-open for one eligible loan or a neutral owned-loan chooser for many.

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
- **80C is computed in two places.** `TaxSavingRoomModal` shows the backend figure
  (`services/tax_saving_room.py`); `healthScore.ts` recomputes taxUtil client-side because the backend
  route requires a `tax_regime` input this screen never asks for. D-112 supersedes D-109's accepted
  cadence mismatch: both now exclude blank/unknown premium cadence and recognise the same six-month
  variants as two payments yearly. Keep the two cadence tables in lockstep.
