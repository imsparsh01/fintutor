const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? 'http://localhost:8000';

// BQ-071 / D-121. Progression is a side effect of using FinTutor, never a precondition
// for it: every function here is fire-and-forget and swallows its own failures. A
// calculator result must render whether or not the ledger accepted the event.
//
// Calculators and scenarios compute client-side (app/lib/scenarios.ts is pure, and
// CalculatorScreen does its own arithmetic), so the backend cannot observe them. That is
// why these emitters live in the app rather than on a route.

export type ProgressionEventType =
  | 'calculator_completed'
  | 'scenario_completed'
  | 'capability_first_used';

export interface ProgressionSummary {
  stage: string;
  points: number;
  active_dimensions: string[];
  return_days: number;
  next_stage: string | null;
  unmet_conditions: Record<string, number>;
  expanding_milestones: number;
  ruleset_version: number;
  last_event_at: string | null;
}

export async function fetchProgression(userId: string): Promise<ProgressionSummary> {
  const res = await fetch(`${BACKEND_URL}/progression?user_id=${userId}`);
  if (!res.ok) {
    throw new Error(`Backend responded ${res.status}`);
  }
  return (await res.json()) as ProgressionSummary;
}

// The one emitter primitive. Never throws, never blocks a render, and deliberately
// returns void — no caller should branch on whether progress was earned, because the
// award rules (daily caps, once-per-subject) live server-side and a client that reacted
// to them would start leaking the scoring model into the UI.
async function emit(
  userId: string,
  eventType: ProgressionEventType,
  subjectKey: string,
  idempotencyKey?: string,
): Promise<void> {
  try {
    await fetch(`${BACKEND_URL}/progression/event?user_id=${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: eventType,
        subject_key: subjectKey,
        // `occurred_at` is intentionally absent — the route does not accept it, so the
        // server clock decides which day this lands on.
        ...(idempotencyKey ? { idempotency_key: idempotencyKey } : {}),
      }),
    });
  } catch {
    // Swallowed on purpose. Losing an event is a smaller harm than a visible error on
    // a screen the user came to for an answer.
  }
}

// A local day-stamp for idempotency keys. This only has to be stable across a
// re-render or a back-navigation within the session; the authoritative Asia/Kolkata day
// boundary is applied server-side, and this string never reaches the ledger's day logic.
function todayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * A calculator produced a valid, rendered result. Not called on screen entry —
 * D-117 awards the result, not the visit.
 *
 * Keyed per calculator type per local day, so re-running the same calculator with
 * different inputs (or navigating back into it) does not mint new events. The backend
 * caps it at one per type per day and two across calculators anyway; this just avoids
 * sending obvious duplicates.
 */
export function recordCalculatorCompleted(userId: string, calculatorType: string): void {
  void emit(
    userId,
    'calculator_completed',
    calculatorType,
    `calculator:${calculatorType}:${todayStamp()}`,
  );
  void emit(userId, 'capability_first_used', 'calculator');
}

/** A scenario produced a valid, rendered result. Same rules as calculators. */
export function recordScenarioCompleted(userId: string, scenarioType: string): void {
  void emit(
    userId,
    'scenario_completed',
    scenarioType,
    `scenario:${scenarioType}:${todayStamp()}`,
  );
  void emit(userId, 'capability_first_used', 'scenario');
}
