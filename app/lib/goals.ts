const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? 'http://localhost:8000';

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
}

export interface GoalCreateInput {
  target_amount: number;
  target_date: string;
  category: string;
  funded_by?: GoalFundingRecord[];
}

export async function fetchGoals(userId: string): Promise<GoalRecord[]> {
  const res = await fetch(`${BACKEND_URL}/goals?user_id=${userId}`);
  if (!res.ok) {
    throw new Error(`Backend responded ${res.status}`);
  }
  return (await res.json()) as GoalRecord[];
}

export async function createGoal(userId: string, input: GoalCreateInput): Promise<GoalRecord> {
  const res = await fetch(`${BACKEND_URL}/goals?user_id=${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...input, funded_by: input.funded_by ?? [] }),
  });
  if (!res.ok) {
    throw new Error(`Backend responded ${res.status}`);
  }
  return (await res.json()) as GoalRecord;
}

export async function updateGoalFunding(
  userId: string,
  goalId: string,
  fundedBy: GoalFundingRecord[],
): Promise<GoalRecord> {
  const res = await fetch(`${BACKEND_URL}/goals/${goalId}/funding?user_id=${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ funded_by: fundedBy }),
  });
  if (!res.ok) throw new Error(`Backend responded ${res.status}`);
  return (await res.json()) as GoalRecord;
}
