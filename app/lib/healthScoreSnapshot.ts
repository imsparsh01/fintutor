import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchBudget } from './budget';
import { computeOverall, computeSubScores } from './healthScore';
import { fetchHoldings } from './holdings';
import type { BudgetSummary } from './budget';
import type { SubScores } from './healthScore';
import type { Holding } from './holdings';

export interface HealthScoreSnapshot {
  budget: BudgetSummary | null;
  holdings: Holding[] | null;
  emergencyMonths: string | null;
  hasHealthIns: 'yes' | 'no' | null;
  subScores: SubScores;
  score: number | null;
  measured: number;
}

let cachedUserId: string | null = null;
let cachedSnapshot: HealthScoreSnapshot | null = null;
let activeLoad: Promise<HealthScoreSnapshot> | null = null;

function buildSnapshot(
  budget: BudgetSummary | null,
  holdings: Holding[] | null,
  emergencyMonths: string | null,
  hasHealthIns: 'yes' | 'no' | null
): HealthScoreSnapshot {
  const subScores = computeSubScores(budget, holdings, emergencyMonths, hasHealthIns);
  const overall = computeOverall(subScores);
  return { budget, holdings, emergencyMonths, hasHealthIns, subScores, ...overall };
}

// BQ-058 / D-110: a deliberately small shared computed-value store. Portfolio refreshes
// the snapshot; HealthScore reuses the same resolved value when opened from Portfolio.
// An in-flight request is shared too, so two consumers cannot duplicate the API calls.
export function loadHealthScoreSnapshot(
  userId: string,
  refresh = false
): Promise<HealthScoreSnapshot> {
  if (!refresh && cachedUserId === userId && cachedSnapshot) {
    return Promise.resolve(cachedSnapshot);
  }
  if (cachedUserId === userId && activeLoad) return activeLoad;

  cachedUserId = userId;
  activeLoad = Promise.all([
    fetchBudget(userId).catch(() => null),
    fetchHoldings(userId).catch((): Holding[] | null => null),
    AsyncStorage.multiGet(['hs_emergency_months', 'hs_has_health_ins']),
  ]).then(([budget, holdings, stored]) => {
    const emergencyMonths = stored[0][1];
    const rawHealthInsurance = stored[1][1];
    const hasHealthIns =
      rawHealthInsurance === 'yes' || rawHealthInsurance === 'no'
        ? rawHealthInsurance
        : null;
    cachedSnapshot = buildSnapshot(budget, holdings, emergencyMonths, hasHealthIns);
    return cachedSnapshot;
  }).finally(() => {
    activeLoad = null;
  });

  return activeLoad;
}

export function updateHealthScoreInputs(
  userId: string,
  updates: Partial<Pick<HealthScoreSnapshot, 'emergencyMonths' | 'hasHealthIns'>>
): HealthScoreSnapshot | null {
  if (cachedUserId !== userId || !cachedSnapshot) return null;
  cachedSnapshot = buildSnapshot(
    cachedSnapshot.budget,
    cachedSnapshot.holdings,
    updates.emergencyMonths ?? cachedSnapshot.emergencyMonths,
    updates.hasHealthIns ?? cachedSnapshot.hasHealthIns
  );
  return cachedSnapshot;
}
