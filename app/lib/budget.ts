import { authenticatedFetch, BACKEND_URL } from './backend';

export interface BudgetSummary {
  income_total: number;
  recurring_outflows_total: number;
  recurring_outflows: {
    product_type: string;
    source_field: string;
    amount: number;
    frequency: string;
    monthly_amount: number;
  }[];
  discretionary_total: number;
  net: number;
  discretionary_categories: { label: string; planned_amount: number }[];
}

export async function fetchBudget(userId: string): Promise<BudgetSummary> {
  const res = await authenticatedFetch(`${BACKEND_URL}/budget`);
  if (!res.ok) {
    throw new Error(`Backend responded ${res.status}`);
  }
  return (await res.json()) as BudgetSummary;
}
