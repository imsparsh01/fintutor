const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? 'http://localhost:8000';

export interface BudgetSummary {
  income_total: number;
  recurring_outflows_total: number;
  discretionary_total: number;
  net: number;
  discretionary_categories: { label: string; planned_amount: number }[];
}

export async function fetchBudget(userId: string): Promise<BudgetSummary> {
  const res = await fetch(`${BACKEND_URL}/budget?user_id=${userId}`);
  if (!res.ok) {
    throw new Error(`Backend responded ${res.status}`);
  }
  return (await res.json()) as BudgetSummary;
}
