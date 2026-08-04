const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? 'http://localhost:8000';

export interface StreakState {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
}

export interface StreakOpenResult extends StreakState {
  reward_fired: boolean;
  reward_type: string | null;
}

export async function fetchStreak(userId: string): Promise<StreakState> {
  const res = await fetch(`${BACKEND_URL}/streak?user_id=${userId}`);
  if (!res.ok) {
    throw new Error(`Backend responded ${res.status}`);
  }
  return (await res.json()) as StreakState;
}

// D-060/BQ-029/BQ-030: call once per app open (ConsolidatedScreen mount) — the backend is
// the source of truth for whether today counts as a new streak day and whether a reward
// fires; this just reports the event and reflects the result.
export async function recordAppOpen(userId: string): Promise<StreakOpenResult> {
  const res = await fetch(`${BACKEND_URL}/streak/open?user_id=${userId}`, { method: 'POST' });
  if (!res.ok) {
    throw new Error(`Backend responded ${res.status}`);
  }
  return (await res.json()) as StreakOpenResult;
}
