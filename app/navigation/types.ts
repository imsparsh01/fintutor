import type { Holding } from '../lib/holdings';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

// D-106: 5-tab nav (Home · Portfolio · Goals · Tools · Chat).
// Family screens (Investments/Loans/Insurance/Budgeting) stay in the navigator as hidden
// screens (tabBarButton: () => null) so existing navigation.navigate calls keep working.
export type CalculatorType = 'sip_goal' | 'emi' | 'inflation' | 'stepup_sip' | 'cagr_backward';

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
  Investments: undefined;
  Loans: undefined;
  Insurance: undefined;
  Budgeting: undefined;
  // BQ-054: Financial Health Score — entered from PortfolioScreen.
  HealthScore: undefined;
};

// BQ-022: each family tab (Investments/Loans/Insurance) is its own small stack —
// List (each family screen's local list) pushes Detail (HoldingDetailScreen) on row tap.
// The full holding is passed via params rather than re-fetched by id, since the list
// screen already has it.
export type HoldingsStackParamList = {
  List: undefined;
  Detail: { holding: Holding };
};
