import { authenticatedFetch, BACKEND_URL } from './backend';
import { noteMeaningfulLearningInteraction } from './learningReminders';

// BQ-071 / D-121. Progression is a side effect of using FinTutor, never a precondition
// for it: every function here is fire-and-forget and swallows its own failures. A
// calculator result must render whether or not the ledger accepted the event.
//
// Calculators and scenarios compute client-side (app/lib/scenarios.ts is pure, and
// CalculatorScreen does its own arithmetic), so the backend cannot observe them. That is
// why these emitters live in the app rather than on a route.

export type ProgressionEventType =
  | 'calculator_completed'
  | 'scenario_completed';

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
  stage_progress: { start: number; end: number; value: number; fraction: number };
}

export interface ProgressionHistoryEvent {
  event_type: string;
  subject_key: string | null;
  dimension: string;
  occurred_at: string;
  local_date: string;
}

export async function fetchProgression(userId: string): Promise<ProgressionSummary> {
  const res = await authenticatedFetch(`${BACKEND_URL}/progression`);
  if (!res.ok) {
    throw new Error(`Backend responded ${res.status}`);
  }
  return (await res.json()) as ProgressionSummary;
}

export async function fetchProgressionHistory(
  userId: string,
  limit = 12,
): Promise<ProgressionHistoryEvent[]> {
  const res = await authenticatedFetch(
    `${BACKEND_URL}/progression/history?limit=${limit}`,
  );
  if (!res.ok) throw new Error(`Backend responded ${res.status}`);
  const body = (await res.json()) as { events: ProgressionHistoryEvent[] };
  return body.events;
}

// The one emitter primitive. Never throws, never blocks a render, and deliberately
// returns void — no caller should branch on whether progress was earned, because the
// award rules (daily caps, once-per-subject) live server-side and a client that reacted
// to them would start leaking the scoring model into the UI.
async function emit(
  userId: string,
  eventType: ProgressionEventType,
  subjectKey: string,
  idempotencyKey: string,
  capabilityFamily: 'calculator' | 'scenario',
): Promise<void> {
  try {
    await authenticatedFetch(`${BACKEND_URL}/progression/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: eventType,
        subject_key: subjectKey,
        // `occurred_at` is intentionally absent — the route does not accept it, so the
        // server clock decides which day this lands on.
        idempotency_key: idempotencyKey,
        capability_family: capabilityFamily,
      }),
    });
  } catch {
    // Swallowed on purpose. Losing an event is a smaller harm than a visible error on
    // a screen the user came to for an answer.
  }
}

// Match D-121's fixed Asia/Kolkata ledger day. Build the ISO-shaped stamp from parts
// rather than relying on a locale's punctuation or field ordering.
function todayStamp(): string {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((candidate) => candidate.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
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
  noteMeaningfulLearningInteraction(userId);
  void emit(
    userId,
    'calculator_completed',
    calculatorType,
    `calculator:${calculatorType}:${todayStamp()}`,
    'calculator',
  );
}

/** A scenario produced a valid, rendered result. Same rules as calculators. */
export function recordScenarioCompleted(userId: string, scenarioType: string): void {
  noteMeaningfulLearningInteraction(userId);
  void emit(
    userId,
    'scenario_completed',
    scenarioType,
    `scenario:${scenarioType}:${todayStamp()}`,
    'scenario',
  );
}
