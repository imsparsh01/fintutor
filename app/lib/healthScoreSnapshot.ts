import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchBudget } from './budget';
import { computeOverall, computeSubScores } from './healthScore';
import { fetchHoldings } from './holdings';
import { fetchFinancialContext } from './financialContext';
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
let loadGeneration = 0;

export function healthInsuranceStorageKey(userId: string): string {
  return `fintutor:health-insurance:${userId}`;
}

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

  const generation = ++loadGeneration;
  cachedUserId = userId;
  activeLoad = Promise.all([
    fetchBudget(userId).catch(() => null),
    fetchHoldings(userId).catch((): Holding[] | null => null),
    fetchFinancialContext().catch(() => null),
    AsyncStorage.getItem(healthInsuranceStorageKey(userId)),
    // D-145: legacy keys were global to the installation and could cross accounts.
    // They are deliberately cleared, never migrated to whichever account logs in next.
    AsyncStorage.multiRemove(['hs_emergency_months', 'hs_has_health_ins']),
  ]).then(([budget, holdings, context, storedHealthInsurance]) => {
    const emergencyMonths = context?.emergency_fund_months === null
      || context?.emergency_fund_months === undefined
      ? null : String(context.emergency_fund_months);
    const rawHealthInsurance = storedHealthInsurance;
    const hasHealthIns =
      rawHealthInsurance === 'yes' || rawHealthInsurance === 'no'
        ? rawHealthInsurance
        : null;
    const snapshot = buildSnapshot(budget, holdings, emergencyMonths, hasHealthIns);
    if (generation === loadGeneration && cachedUserId === userId) cachedSnapshot = snapshot;
    return snapshot;
  }).finally(() => {
    if (generation === loadGeneration) activeLoad = null;
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
