<!-- Generated: 2026-08-11 | Files scanned: 56 frontend files | Token estimate: ~800 -->

# FinTutor — Frontend Codemap

## Entry: `app/App.tsx` → `app/navigation/RootNavigator.tsx`

## Navigation: `app/navigation/MainTabs.tsx`

D-106: 5 visible tabs (Home · Portfolio · Goals · Tools · Chat). Former family tabs are hidden
screens (tabBarButton: () => null) — navigable from PortfolioScreen without showing in tab bar.
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
OnboardingScreen        screens/ (127)             Chip-guided 4-track conversation (D-082/D-084)
ConsolidatedScreen      screens/ (233)             "Home" tab — net totals + streak + reward surface
PortfolioScreen         screens/ (104)             Portfolio tab — family nav rows + Health Score entry + BQ-058/061 stubs
HealthScoreScreen       screens/ (260)             Hidden tab — 0-100 score + 4 sub-score rows; entered from PortfolioScreen
GoalsScreen             screens/ (~640)            Goals tab — goal progress rows, 4 goal-type cards with
                                                   inline create form, insurance coverage summary,
                                                   emergency readiness CTA (BQ-059)
ToolsScreen             screens/ (80)              Tools tab — calculator list grid (5 items, batch 1)
CalculatorScreen        screens/ (420)             Hidden tab — 5 calculators: C-04/C-10/C-17/C-22/C-24
ScenarioScreen          screens/ (~620)            Hidden tab — 5 "What if…" scenarios: S-05/S-03/S-06/S-07/S-01.
                                                   Prefills inputs from budget+holdings; every field editable.
InvestmentsScreen       screens/ (338)             Hidden tab — holdings list (equity/debt/fd/ppf/stocks)
LoansScreen             screens/ (290)             Hidden tab — holdings list (home_loan/personal_loan/cc)
InsuranceScreen         screens/ (296)             Hidden tab — holdings list (term_insurance/endowment_ulip)
BudgetingScreen         screens/ (659)             Hidden tab — income + goals + discretionary + tax room
ChatScreen              screens/ (47)              Chat tab — thin wrapper rendering ChatThread
HoldingDetailScreen     screens/ (357)             Single holding — edit + ESOP/LoanVsInvest modals
```

## Component inventory

```
Component                   File (lines)       Purpose
──────────────────────────────────────────────────────────────────────────────
ChatThread                  components/ (~470) Core chat UI — Arya header (BQ-055), message list, input,
                                               proposal card rendering, reconciliation status (D-099).
                                               AryaHeader rendered when !onboarding (D-105).
HoldingProposalCard         components/ (138)  Confirm/reject holding capture proposal (D-078 Fork 2)
HoldingEditModal            components/ (326)  Add/edit holding — schema-driven form via characteristicsSchema
ConsolidatedTotalsCard      components/ (94)   Home totals — uses metadata flags not numeric zero (D-097)
TeachingWalkthrough         components/ (312)  Full-screen P9-guarded walkthrough (D-090). Four-part guard:
                                               skip on every step, nothing unlocks, no comprehension check,
                                               freely navigable. Receives steps[] + family name as props.
TeachingBlock               components/ (46)   Inline teaching paragraph (used inside family screens)
LoanVsInvestModal           components/ (335)  Prepayment vs invest calculator (D-014)
EsopExerciseCostModal       components/ (166)  ESOP exercise cost today (D-066)
TaxSavingRoomModal          components/ (260)  80C/NPS headroom calculator (D-016)
StreakBadge                 components/ (32)   Streak counter — behaviour color only (P7)
[Mascot deleted — BQ-053]
```

## lib/ — API and state

```
File                    Lines   Purpose
────────────────────────────────────────────────────────────────────────────
backend.ts              17      Base URL (EXPO_PUBLIC_BACKEND_URL ?? localhost:8000)
chat.ts                 78      sendChatMessage() — POST /chat wrapper; onboarding fields
holdings.ts             74      fetchHoldings / createHolding / updateHolding / deleteHolding
consolidated.ts         30      fetchConsolidated() → {families, totals, metadata}
budget.ts               24      fetchBudget() → {income, provenance, goals, discretionary, taxRoom}
income.ts               53      fetchIncome / saveIncome
goals.ts                45      fetchGoals / createGoal
onboarding.ts           17      hasSeenOnboarding / markOnboardingSeen (AsyncStorage)
reminders.ts            50      scheduleReminder() — Expo Notifications; credit card due + EMI due day (D-101)
streaks.ts              32      fetchStreak / recordAppOpen
surfacing.ts            17      fetchSurfacingCandidates()
characteristicsSchema.ts 94     CHARACTERISTICS_SCHEMA — per-product-type field definitions for HoldingEditModal
walkthroughSteps.ts     42      Per-family static step arrays for TeachingWalkthrough (D-096)
rewardFacts.ts          9       Curated mechanism-fact array for app-open reward surface (D-100)
taxSavingRoom.ts        24      fetchTaxSavingRoom()
loanVsInvest.ts         30      fetchLoanVsInvest()
esopExerciseCost.ts     26      fetchEsopExerciseCost()
healthScore.ts          60      computeSubScores(budget,holdings,months,hasHealthIns) → {investmentRate,insurance,emergency,taxUtil}
                                computeOverall(scores) → {score,measured}; pure functions, no side effects
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
```
All 5 are pure frontend math. Batch 2 (C-16 income tax, C-23 HRA) approved but not yet built.

## Scenario types (D-106, BQ-056)

```
ScenarioType (navigation/types.ts):
  'emergency_runway'  S-05 — months your balances cover with no income
  'sip_increase'      S-03 — corpus difference from an extra monthly amount
  'debt_cost'         S-06 — interest inside the remaining repayments
  'idle_cash'         S-07 — a cash balance compounded at two user-set rates
  'corpus_target'     S-01 — years until the corpus reaches a user-set target
```
S-04 (rent vs buy) parked — needs schema fields. S-02 (prepay vs invest) is LoanVsInvestModal (D-014).

## Key patterns

- All screens call backend lib functions (not fetch directly).
- `HoldingEditModal` is driven entirely by `CHARACTERISTICS_SCHEMA[product_type]` — adding a new type only
  requires adding an entry there.
- `TeachingWalkthrough` is reused by all three family screens; steps come from `walkthroughSteps.ts`.
- `ChatThread` handles both the general Chat tab and the onboarding conversation — distinguished by the
  `onboarding` prop which controls Arya header visibility and sets `onboarding: true` in the POST /chat body.
- `CalculatorScreen` receives `{ type: CalculatorType; label: string }` as route params and renders the
  appropriate calculator. ToolsScreen is the only entry point (hidden tab pattern).
- **AsyncStorage keys `hs_emergency_months` / `hs_has_health_ins`** are written by HealthScoreScreen and
  read by both HealthScoreScreen and GoalsScreen. One answer, two surfaces — do not add a second prompt
  for either question. No vector-icon library is installed: GoalsScreen's goal-type marks are drawn from
  plain Views (rotated squares, a CSS-triangle roof, bordered circles).
