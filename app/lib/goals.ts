import { authenticatedFetch, BACKEND_URL } from './backend';
import { readApiResponse } from './apiResponse';

export interface GoalFundingRecord {
  holding_id: string;
  earmarked_amount: number;
}

export interface GoalRecord {
  id: string;
  user_id: string;
  target_amount: number;
  target_date: string;
  category: string;
  funded_by: GoalFundingRecord[];
  progress: number;
  version: number;
  progress_status: 'measured' | 'partial';
  progress_is_partial: boolean;
  progress_provenance: GoalProgressProvenance[];
}

export type GoalProgressUnknownReason =
  | 'holding_unavailable'
  | 'product_type_excluded'
  | 'product_type_unclassified'
  | 'valuation_missing'
  | 'valuation_invalid'
  | 'valuation_negative';

export interface GoalProgressProvenance {
  holding_id: string;
  holding_alias: string | null;
  holding_display_name: string | null;
  product_type: string | null;
  valuation_field: string | null;
  /** Exact two-decimal backend representation, or the bounded invalid input for explanation. */
  recorded_value: string | null;
  earmarked_amount: number;
  applied_amount: number | null;
  proportional_adjustment: number | null;
  was_proportionally_adjusted: boolean;
  status: 'applied' | 'unknown';
  reason: GoalProgressUnknownReason | null;
}

export interface GoalDeletionImpact {
  record_type: 'goal';
  record_id: string;
  category: string;
  target_amount: number;
  target_date: string;
  funding_links_removed: number;
  affects: string[];
  version: number;
}

export interface GoalDeletionResult {
  deleted: true;
  impact: GoalDeletionImpact;
}

export interface GoalCreateInput {
  target_amount: number;
  target_date: string;
  category: string;
  funded_by?: GoalFundingRecord[];
}

export async function fetchGoals(userId: string): Promise<GoalRecord[]> {
  const res = await authenticatedFetch(`${BACKEND_URL}/goals`);
  return readApiResponse<GoalRecord[]>(res);
}

export async function createGoal(userId: string, input: GoalCreateInput): Promise<GoalRecord> {
  const res = await authenticatedFetch(`${BACKEND_URL}/goals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...input, funded_by: input.funded_by ?? [] }),
  });
  return readApiResponse<GoalRecord>(res);
}

export async function updateGoalFunding(
  userId: string,
  goalId: string,
  fundedBy: GoalFundingRecord[],
  expectedVersion?: number,
): Promise<GoalRecord> {
  const res = await authenticatedFetch(`${BACKEND_URL}/goals/${goalId}/funding`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ funded_by: fundedBy, expected_version: expectedVersion }),
  });
  return readApiResponse<GoalRecord>(res);
}

export async function fetchGoalDeletionImpact(
  userId: string, goalId: string,
): Promise<GoalDeletionImpact> {
  const res = await authenticatedFetch(`${BACKEND_URL}/goals/${goalId}/deletion-impact`);
  return readApiResponse<GoalDeletionImpact>(res);
}

export async function updateGoal(
  userId: string, goalId: string, input: GoalCreateInput, expectedVersion: number,
): Promise<GoalRecord> {
  const res = await authenticatedFetch(`${BACKEND_URL}/goals/${goalId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...input,
      funded_by: input.funded_by ?? [],
      expected_version: expectedVersion,
    }),
  });
  return readApiResponse<GoalRecord>(res);
}

export async function deleteGoal(
  userId: string, goalId: string, expectedVersion: number,
): Promise<GoalDeletionResult> {
  const query = new URLSearchParams({ expected_version: String(expectedVersion) });
  const res = await authenticatedFetch(`${BACKEND_URL}/goals/${goalId}?${query}`, {
    method: 'DELETE',
  });
  return readApiResponse<GoalDeletionResult>(res);
}
