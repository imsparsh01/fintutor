const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? 'http://localhost:8000';

// D-065: per-family totals, not a single net-worth figure — see BQ-018/D-065's write-up
// for why (FD/RD has no accrued-value field; a signed net figure would overstate
// precision it doesn't have).
export interface ConsolidatedTotals {
  investments_total: number;
  loans_total: number;
  insurance_total: number;
}

export async function fetchConsolidated(userId: string): Promise<ConsolidatedTotals> {
  const res = await fetch(`${BACKEND_URL}/consolidated?user_id=${userId}`);
  if (!res.ok) {
    throw new Error(`Backend responded ${res.status}`);
  }
  return (await res.json()) as ConsolidatedTotals;
}
