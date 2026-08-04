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
}

export async function fetchGoals(userId: string): Promise<GoalRecord[]> {
  const res = await fetch(`${BACKEND_URL}/goals?user_id=${userId}`);
  if (!res.ok) {
    throw new Error(`Backend responded ${res.status}`);
  }
  return (await res.json()) as GoalRecord[];
}

// No funded_by picker in this pass — a goal is created unfunded and can be linked to
// holdings later; scoped out the same way BQ-027 scoped characteristics editing out of
// its first pass, not silently dropped.
export async function createGoal(userId: string, input: GoalCreateInput): Promise<GoalRecord> {
  const res = await fetch(`${BACKEND_URL}/goals?user_id=${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...input, funded_by: [] }),
  });
  if (!res.ok) {
    throw new Error(`Backend responded ${res.status}`);
  }
  return (await res.json()) as GoalRecord;
}
