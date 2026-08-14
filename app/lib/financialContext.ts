import { authenticatedFetch, BACKEND_URL } from './backend';

export interface FinancialContext {
  dependant_count: number | null;
  emergency_fund_months: number | null;
  updated_at: string | null;
}

async function contextRequest(init?: RequestInit): Promise<FinancialContext> {
  const response = await authenticatedFetch(`${BACKEND_URL}/financial-context`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(body?.detail ?? 'Financial context could not be updated.');
  }
  return (await response.json()) as FinancialContext;
}

export function fetchFinancialContext(): Promise<FinancialContext> {
  return contextRequest();
}

export function saveFinancialContext(
  dependantCount: number | null,
  emergencyFundMonths: number | null,
): Promise<FinancialContext> {
  return contextRequest({
    method: 'PUT',
    body: JSON.stringify({
      dependant_count: dependantCount,
      emergency_fund_months: emergencyFundMonths,
    }),
  });
}

export function patchFinancialContext(
  values: Partial<Pick<FinancialContext, 'dependant_count' | 'emergency_fund_months'>>,
): Promise<FinancialContext> {
  return contextRequest({ method: 'PATCH', body: JSON.stringify(values) });
}

export function clearFinancialContext(): Promise<FinancialContext> {
  return contextRequest({ method: 'DELETE' });
}
