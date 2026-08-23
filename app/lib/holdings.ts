import { authenticatedFetch, BACKEND_URL } from './backend';
import { readApiResponse } from './apiResponse';

export interface Holding {
  id: string;
  product_type: string;
  alias: string;
  display_name: string | null;
  characteristics: Record<string, unknown>;
  version: number;
  reconciliation?: {
    status: 'new' | 'updated' | 'contradiction';
    product_type: string;
    changed_fields: string[];
  };
}

export interface HoldingUpdate {
  product_type?: string;
  alias?: string;
  display_name?: string | null;
  characteristics?: Record<string, unknown>;
  expected_version?: number;
}

export interface HoldingDeletionImpact {
  record_type: 'holding';
  record_id: string;
  display_label: string;
  funding_links_removed: number;
  affected_goals: {
    id: string;
    category: string;
    earmarked_amount: number;
  }[];
  affects: string[];
  version: number;
}

export interface HoldingDeletionResult {
  deleted: true;
  impact: HoldingDeletionImpact;
}

// D-074: no alias field — the backend generates one. Used only by the manual add-holding
// flow; direct API callers may still supply their own alias via a raw request.
export interface HoldingCreate {
  product_type: string;
  display_name?: string | null;
  characteristics?: Record<string, unknown>;
}

export async function fetchHoldings(userId: string): Promise<Holding[]> {
  const res = await authenticatedFetch(`${BACKEND_URL}/holdings`);
  return readApiResponse<Holding[]>(res);
}

export async function createHolding(userId: string, data: HoldingCreate): Promise<Holding> {
  const res = await authenticatedFetch(`${BACKEND_URL}/holdings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return readApiResponse<Holding>(res);
}

export async function updateHolding(
  userId: string,
  holdingId: string,
  updates: HoldingUpdate,
  expectedVersion: number,
): Promise<Holding> {
  const res = await authenticatedFetch(`${BACKEND_URL}/holdings/${holdingId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...updates, expected_version: expectedVersion }),
  });
  return readApiResponse<Holding>(res);
}

export async function fetchHoldingDeletionImpact(
  userId: string, holdingId: string,
): Promise<HoldingDeletionImpact> {
  const res = await authenticatedFetch(`${BACKEND_URL}/holdings/${holdingId}/deletion-impact`);
  return readApiResponse<HoldingDeletionImpact>(res);
}

export async function deleteHolding(
  userId: string, holdingId: string, expectedVersion: number,
): Promise<HoldingDeletionResult | void> {
  const suffix = `?${new URLSearchParams({ expected_version: String(expectedVersion) })}`;
  const res = await authenticatedFetch(`${BACKEND_URL}/holdings/${holdingId}${suffix}`, {
    method: 'DELETE',
  });
  return readApiResponse<HoldingDeletionResult | void>(res);
}
