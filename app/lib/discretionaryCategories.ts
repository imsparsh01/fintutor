import { authenticatedFetch, BACKEND_URL } from './backend';
import { readApiResponse } from './apiResponse';

export interface DiscretionaryCategory {
  id: string;
  label: string;
  planned_amount: number;
  version: number;
}

export interface DiscretionaryDeletionImpact {
  record_type: 'discretionary_category';
  record_id: string;
  label: string;
  planned_amount: number;
  affects: string[];
  version: number;
}

export interface DiscretionaryDeletionResult {
  deleted: true;
  impact: DiscretionaryDeletionImpact;
}

export async function fetchDiscretionaryCategories(
  userId: string
): Promise<DiscretionaryCategory[]> {
  const res = await authenticatedFetch(`${BACKEND_URL}/discretionary-categories`);
  return readApiResponse<DiscretionaryCategory[]>(res);
}

export async function createDiscretionaryCategory(
  userId: string,
  label: string,
  plannedAmount: number
): Promise<DiscretionaryCategory> {
  const res = await authenticatedFetch(`${BACKEND_URL}/discretionary-categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label, planned_amount: plannedAmount }),
  });
  return readApiResponse<DiscretionaryCategory>(res);
}

export async function fetchDiscretionaryCategoryDeletionImpact(
  userId: string, categoryId: string,
): Promise<DiscretionaryDeletionImpact> {
  const res = await authenticatedFetch(
    `${BACKEND_URL}/discretionary-categories/${categoryId}/deletion-impact`,
  );
  return readApiResponse<DiscretionaryDeletionImpact>(res);
}

export async function updateDiscretionaryCategory(
  userId: string, categoryId: string, label: string,
  plannedAmount: number, expectedVersion: number,
): Promise<DiscretionaryCategory> {
  const res = await authenticatedFetch(`${BACKEND_URL}/discretionary-categories/${categoryId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label, planned_amount: plannedAmount, expected_version: expectedVersion }),
  });
  return readApiResponse<DiscretionaryCategory>(res);
}

export async function deleteDiscretionaryCategory(
  userId: string, categoryId: string, expectedVersion: number,
): Promise<DiscretionaryDeletionResult> {
  const query = new URLSearchParams({ expected_version: String(expectedVersion) });
  const res = await authenticatedFetch(
    `${BACKEND_URL}/discretionary-categories/${categoryId}?${query}`,
    { method: 'DELETE' },
  );
  return readApiResponse<DiscretionaryDeletionResult>(res);
}
