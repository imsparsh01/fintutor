import type { Holding } from '../lib/holdings';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabsParamList = {
  Consolidated: undefined;
  // BQ-022: navigated to from a holding's detail screen with a pre-filled question.
  Chat: { prefillQuestion?: string } | undefined;
  Investments: undefined;
  Loans: undefined;
  Insurance: undefined;
  Budgeting: undefined;
};

// BQ-022: each family tab (Investments/Loans/Insurance) is its own small stack —
// List (HoldingsList) pushes Detail (HoldingDetailScreen) on row tap. The full holding
// is passed via params rather than re-fetched by id, since the list screen already has it.
export type HoldingsStackParamList = {
  List: undefined;
  Detail: { holding: Holding };
};
