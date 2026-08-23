import { authenticatedFetch, BACKEND_URL } from './backend';
import { readApiResponse } from './apiResponse';

export interface IncomeSource {
  id?: string;
  label: string;
  // D-073: the floor/conservative figure — what the budget's math is checked against.
  amount: number;
  frequency: string;
  // D-073: optional, purely informational "typical" figure for variable income. Never
  // fed into budget math — shown alongside `amount`, not computed with.
  amount_high?: number | null;
}

export interface IncomeRecord {
  id: string;
  user_id: string;
  sources: IncomeSource[];
  version: number;
}

export interface IncomeSourceDeletionImpact {
  record_type: 'income_source';
  record_id: string;
  label: string | null;
  amount?: number;
  frequency?: string;
  affects: string[];
  version?: number;
}

export interface IncomeDeletionResult {
  deleted: true;
  impact: IncomeSourceDeletionImpact;
  current: IncomeRecord;
}

export async function fetchIncome(userId: string): Promise<IncomeRecord[]> {
  const res = await authenticatedFetch(`${BACKEND_URL}/income`);
  return readApiResponse<IncomeRecord[]>(res);
}

export async function createIncome(userId: string, sources: IncomeSource[]): Promise<IncomeRecord> {
  const res = await authenticatedFetch(`${BACKEND_URL}/income`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sources }),
  });
  return readApiResponse<IncomeRecord>(res);
}

export async function updateIncome(
  userId: string,
  incomeId: string,
  sources: IncomeSource[],
  expectedVersion?: number,
): Promise<IncomeRecord> {
  const res = await authenticatedFetch(`${BACKEND_URL}/income/${incomeId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sources, expected_version: expectedVersion }),
  });
  return readApiResponse<IncomeRecord>(res);
}

export async function fetchIncomeSourceDeletionImpact(
  userId: string, incomeId: string, sourceId: string,
): Promise<IncomeSourceDeletionImpact> {
  const res = await authenticatedFetch(
    `${BACKEND_URL}/income/${incomeId}/sources/${sourceId}/deletion-impact`,
  );
  return readApiResponse<IncomeSourceDeletionImpact>(res);
}

export async function updateIncomeSource(
  userId: string, incomeId: string, sourceId: string,
  source: IncomeSource, expectedVersion: number,
): Promise<IncomeRecord> {
  const res = await authenticatedFetch(`${BACKEND_URL}/income/${incomeId}/sources/${sourceId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source, expected_version: expectedVersion }),
  });
  return readApiResponse<IncomeRecord>(res);
}

export async function deleteIncomeSource(
  userId: string, incomeId: string, sourceId: string, expectedVersion: number,
): Promise<IncomeDeletionResult> {
  const query = new URLSearchParams({ expected_version: String(expectedVersion) });
  const res = await authenticatedFetch(
    `${BACKEND_URL}/income/${incomeId}/sources/${sourceId}?${query}`,
    { method: 'DELETE' },
  );
  return readApiResponse<IncomeDeletionResult>(res);
}
