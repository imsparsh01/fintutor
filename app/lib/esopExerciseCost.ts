const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? 'http://localhost:8000';

export interface EsopExerciseCostResult {
  holding_id: string;
  vested_units: number;
  total_units_granted: number;
  exercise_cost: number;
  exercised_units_assumption_note: string;
  spread: number | null;
  spread_note: string | null;
  exercise_window_note: string | null;
}

// D-069/BRIEF-015: cost of exercising today only, never a prediction of future valuation.
export async function fetchEsopExerciseCost(
  userId: string,
  holdingId: string
): Promise<EsopExerciseCostResult> {
  const params = new URLSearchParams({ user_id: userId, holding_id: holdingId });
  const res = await fetch(`${BACKEND_URL}/esop-exercise-cost?${params.toString()}`);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail ?? `Backend responded ${res.status}`);
  }
  return (await res.json()) as EsopExerciseCostResult;
}
