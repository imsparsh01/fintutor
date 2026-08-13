import { authenticatedFetch, BACKEND_URL } from './backend';

// D-065: per-family totals, not a single net-worth figure — see BQ-018/D-065's write-up
// for why (FD/RD has no accrued-value field; a signed net figure would overstate
// precision it doesn't have).
export interface ConsolidatedTotals {
  investments_total: number;
  loans_total: number;
  insurance_total: number;
  investments_status: 'empty' | 'valued' | 'unvalued' | 'mixed' | 'excluded';
  loans_status: 'empty' | 'valued' | 'unvalued' | 'mixed' | 'excluded';
  insurance_status: 'empty' | 'valued' | 'unvalued' | 'mixed' | 'excluded';
  investments_holding_count: number;
  loans_holding_count: number;
  insurance_holding_count: number;
  investments_valued_holding_count: number;
  loans_valued_holding_count: number;
  insurance_valued_holding_count: number;
  investments_excluded_holding_count: number;
  loans_excluded_holding_count: number;
  insurance_excluded_holding_count: number;
}

export async function fetchConsolidated(userId: string): Promise<ConsolidatedTotals> {
  const res = await authenticatedFetch(`${BACKEND_URL}/consolidated`);
  if (!res.ok) {
    throw new Error(`Backend responded ${res.status}`);
  }
  return (await res.json()) as ConsolidatedTotals;
}
