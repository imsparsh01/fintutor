import type { Holding } from './holdings';

// BQ-061 (D-106 Decision 4): category concentration.
//
// Deliberately NOT called "overlap". True overlap is whether two equity funds hold the same
// underlying stocks, and answering that needs scheme-level holdings data the app does not have
// and does not fetch. What this computes is how the user's mutual funds spread across the broad
// categories the taxonomy already records — a fact about their own recorded holdings, nothing more.
//
// Counts only. D-106 rules out a rupee figure here: a concentration percentage by value would
// read as a portfolio-weighting verdict, which is the advice line (P2/D-009).
//
// D-106 names "equity/debt/hybrid" as the categories. There is no hybrid fund type in D-013's
// taxonomy, so only the two that exist are counted. If a hybrid type is ever added, add it here.

const FUND_CATEGORIES: { productType: string; label: string }[] = [
  { productType: 'equity_mutual_fund', label: 'Equity funds' },
  { productType: 'debt_mutual_fund', label: 'Debt funds' },
];

export interface CategoryCount {
  productType: string;
  label: string;
  count: number;
}

export interface ConcentrationSummary {
  totalFunds: number;
  // Non-empty categories only, largest first.
  categories: CategoryCount[];
  largest: CategoryCount | null;
}

// Returns null when holdings are unavailable (API error) — distinct from a user who holds
// no mutual funds, which is a real answer of zero.
export function computeCategoryConcentration(
  holdings: Holding[] | null
): ConcentrationSummary | null {
  if (holdings === null) return null;

  const categories = FUND_CATEGORIES.map(({ productType, label }) => ({
    productType,
    label,
    count: holdings.filter((h) => h.product_type === productType).length,
  }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);

  const totalFunds = categories.reduce((sum, c) => sum + c.count, 0);

  return {
    totalFunds,
    categories,
    largest: categories.length > 0 ? categories[0] : null,
  };
}
