import type { BudgetSummary } from './budget';
import type { Holding } from './holdings';

// Product types that count as investment outflows for the investment rate sub-score.
const SIP_TYPES = ['equity_mutual_fund', 'debt_mutual_fund'];

// Product types that contribute to 80C tax utilisation.
const TAX_80C_TYPES = ['ppf', 'epf'];
const TAX_80C_INSURANCE_TYPES = ['term_insurance', 'endowment_ulip'];

export interface SubScores {
  investmentRate: number | null;
  insurance: number | null;
  emergency: number | null;
  taxUtil: number | null;
}

// Pure function — no side effects, fully unit-testable.
// null sub-score = data not available (either API error or user hasn't answered the question).
// Guards against NaN from AsyncStorage strings, missing characteristics fields, and API failures.
export function computeSubScores(
  budget: BudgetSummary | null,
  holdings: Holding[] | null,
  emergencyMonths: string | null,
  hasHealthIns: 'yes' | 'no' | null
): SubScores {
  // ── Investment rate ────────────────────────────────────────────────────────
  let investmentRate: number | null = null;
  if (budget !== null) {
    const income = budget.income_total;
    if (income > 0) {
      const sipMonthly = budget.recurring_outflows
        .filter((o) => SIP_TYPES.includes(o.product_type))
        .reduce((sum, o) => sum + o.monthly_amount, 0);
      investmentRate = Math.min(100, Math.round((sipMonthly / income / 0.1) * 100));
    }
    // income === 0 → null (user has no income in budget, CTA to add income data)
  }
  // budget === null → API error → null (not 0, because we can't distinguish from no-income)

  // ── Insurance safety net ──────────────────────────────────────────────────
  let insurance: number | null = null;
  if (hasHealthIns !== null && holdings !== null) {
    const hasTerm = holdings.some((h) => h.product_type === 'term_insurance');
    if (hasHealthIns === 'no') {
      insurance = 0;
    } else {
      // hasHealthIns === 'yes'
      insurance = hasTerm ? 75 : 50;
    }
  }
  // hasHealthIns === null → user hasn't answered → null (CTA to answer)
  // holdings === null → API error → null (can't confirm term presence)

  // ── Emergency buffer ──────────────────────────────────────────────────────
  let emergency: number | null = null;
  if (emergencyMonths !== null) {
    const months = parseFloat(emergencyMonths);
    if (!isNaN(months) && months >= 0 && months <= 120) {
      emergency = Math.min(100, Math.round(months * 8.33));
    }
    // NaN or out-of-range → null (invalid entry, treat as unanswered)
  }

  // ── Tax utilisation ───────────────────────────────────────────────────────
  let taxUtil: number | null = null;
  if (holdings !== null) {
    let annual80C = 0;
    for (const h of holdings) {
      if (TAX_80C_TYPES.includes(h.product_type)) {
        annual80C += Number(h.characteristics.annual_contribution) || 0;
      }
      if (TAX_80C_INSURANCE_TYPES.includes(h.product_type)) {
        annual80C += Number(h.characteristics.premium_annual) || 0;
      }
    }
    taxUtil = Math.min(100, Math.round((annual80C / 150000) * 100));
    // Empty holdings array → annual80C=0 → taxUtil=0 (correct: no 80C contributions)
  }
  // holdings === null → API error → null

  return { investmentRate, insurance, emergency, taxUtil };
}

// Returns the overall score (average of non-null sub-scores) and the count of measured areas.
export function computeOverall(scores: SubScores): { score: number | null; measured: number } {
  const values = [scores.investmentRate, scores.insurance, scores.emergency, scores.taxUtil].filter(
    (v): v is number => v !== null
  );
  return {
    score: values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null,
    measured: values.length,
  };
}
