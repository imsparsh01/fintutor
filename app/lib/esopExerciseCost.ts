import { authenticatedFetch, BACKEND_URL } from './backend';

export interface EsopExerciseCostResult {
  holding_id: string;
  vested_units: number;
  total_units_granted: number;
  exercise_cost: number;
  exercised_units_assumption_note: string;
  vesting_timing_note: string;
  calculation_date: string;
  calculation_timezone: 'Asia/Kolkata';
  fmv_basis_label: 'Recorded FMV';
  spread: number | null;
  spread_note: string | null;
  exercise_window_note: string | null;
  source_evidence: {
    source_kind: 'holding';
    source_record_id: string;
    source_label: string;
    source_fields: string[];
    source_version: number;
    record_updated_at: null;
    retrieved_at: string;
    freshness: 'unavailable';
    freshness_note: 'Freshness unavailable';
  };
}

// D-069/BRIEF-015: cost of exercising today only, never a prediction of future valuation.
export async function fetchEsopExerciseCost(
  userId: string,
  holdingId: string
): Promise<EsopExerciseCostResult> {
  const params = new URLSearchParams({ holding_id: holdingId });
  const res = await authenticatedFetch(`${BACKEND_URL}/esop-exercise-cost?${params.toString()}`);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail ?? `Backend responded ${res.status}`);
  }
  return (await res.json()) as EsopExerciseCostResult;
}
