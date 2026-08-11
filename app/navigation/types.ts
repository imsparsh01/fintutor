import type { Holding } from '../lib/holdings';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

// D-106: 5-tab nav (Home · Portfolio · Goals · Tools · Chat).
// Family screens (Investments/Loans/Insurance/Budgeting) stay in the navigator as hidden
// screens (tabBarButton: () => null) so existing navigation.navigate calls keep working.
export type CalculatorType = 'sip_goal' | 'emi' | 'inflation' | 'stepup_sip' | 'cagr_backward';

// BQ-056 (D-106): scenario batch 1. S-04 (rent vs buy) is parked — it needs input fields the
// schema doesn't have. S-02 (prepay vs invest) is already the LoanVsInvest modal (D-014).
export type ScenarioType =
  | 'emergency_runway' // S-05
  | 'sip_increase' // S-03
  | 'debt_cost' // S-06
  | 'idle_cash' // S-07
  | 'corpus_target'; // S-01

export type PortfolioHealthFocus = 'investmentRate' | 'insurance' | 'emergency' | 'taxUtil';

export type MainTabsParamList = {
  Consolidated: undefined;
  Portfolio: undefined;
  Goals: undefined;
  Tools: undefined;
  // BQ-022: navigated to from a holding's detail screen with a pre-filled question.
  // deepenAlias (D-071): set only alongside prefillQuestion by that same entry point.
  Chat: { prefillQuestion?: string; deepenAlias?: string } | undefined;
  // Hidden (tabBarButton: null) — D-106: family screens remain navigable from Portfolio/Home.
  Calculator: { type: CalculatorType; label: string };
  // BQ-056: "What if…" scenarios — entered from ToolsScreen, same hidden-tab pattern.
  Scenario: { type: ScenarioType; label: string };
  Investments: undefined;
  Loans: undefined;
  Insurance: undefined;
  Budgeting: undefined;
  // BQ-054/BQ-060: Portfolio Health — optionally opens one sub-score's mechanism detail.
  HealthScore: { focus?: PortfolioHealthFocus } | undefined;
  // BQ-068: hidden voluntary route for grandfathered users; never a primary tab.
  Assessment: undefined;
};

// BQ-022: each family tab (Investments/Loans/Insurance) is its own small stack —
// List (each family screen's local list) pushes Detail (HoldingDetailScreen) on row tap.
// The full holding is passed via params rather than re-fetched by id, since the list
// screen already has it.
export type HoldingsStackParamList = {
  List: undefined;
  Detail: { holding: Holding };
};
