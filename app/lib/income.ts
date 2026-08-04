const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? 'http://localhost:8000';

export interface IncomeSource {
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
}

export async function fetchIncome(userId: string): Promise<IncomeRecord[]> {
  const res = await fetch(`${BACKEND_URL}/income?user_id=${userId}`);
  if (!res.ok) {
    throw new Error(`Backend responded ${res.status}`);
  }
  return (await res.json()) as IncomeRecord[];
}

export async function createIncome(userId: string, sources: IncomeSource[]): Promise<IncomeRecord> {
  const res = await fetch(`${BACKEND_URL}/income?user_id=${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sources }),
  });
  if (!res.ok) {
    throw new Error(`Backend responded ${res.status}`);
  }
  return (await res.json()) as IncomeRecord;
}

export async function updateIncome(
  userId: string,
  incomeId: string,
  sources: IncomeSource[]
): Promise<IncomeRecord> {
  const res = await fetch(`${BACKEND_URL}/income/${incomeId}?user_id=${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sources }),
  });
  if (!res.ok) {
    throw new Error(`Backend responded ${res.status}`);
  }
  return (await res.json()) as IncomeRecord;
}
