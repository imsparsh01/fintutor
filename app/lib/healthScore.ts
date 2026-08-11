import type { BudgetSummary } from './budget';
import type { Holding } from './holdings';

// Product types that count as investment outflows for the investment rate sub-score.
const SIP_TYPES = ['equity_mutual_fund', 'debt_mutual_fund'];

// Product types that contribute to 80C tax utilisation. `ppf_epf` is a single D-013 taxonomy
// type (see taxonomy.ts INVESTMENT_TYPES) — PPF and EPF are distinguished by the
// `retirement_fund_type` characteristic, not by product_type, and both count toward 80C.
// Matches backend/app/services/tax_saving_room.py's own 80C filter.
const TAX_80C_TYPES = ['ppf_epf'];
const TAX_80C_INSURANCE_TYPES = ['term_insurance', 'endowment_ulip'];

// Cadences recognised for annualising an insurance premium. Deliberately the same set as
// backend/app/services/budget.py's `_RECURRING_FREQUENCIES`, so the frontend and backend agree
// on what counts as a stated cadence rather than each accepting its own vocabulary.
// Note: "half-yearly"/"semi-annual" is NOT here — the backend doesn't recognise it either, and
// inventing a divisor the backend lacks would make the two 80C figures disagree. Such a premium
// is excluded (see the Option C rule below), not guessed at.
const RECURRING_FREQUENCIES = new Set([
  'monthly', 'month', 'quarterly', 'quarter',
  'annual', 'annually', 'yearly', 'year', 'weekly', 'week',
]);

// Annualises a premium from its stated cadence. Mirrors `_to_monthly` in
// backend/app/services/budget.py, then scales to a year.
//
// Returns null when there is no amount or no explicitly recognised cadence. This is the
// "Option C" rule budget.py already applies to recurring outflows: an amount without a stated
// cadence is NOT silently read as monthly. It matters here because reading a blank cadence as
// monthly would multiply an annually-paid premium by 12 and pin `taxUtil` at 100 — overstating
// a figure the user relies on. Under-counting is the safer failure for this screen, and it
// matches the rule `investmentRate` already inherits via `budget.recurring_outflows`.
//
// This intentionally differs from backend/app/services/tax_saving_room.py, which calls
// `_to_monthly` bare and so does treat an unrecognised cadence as monthly. The two 80C figures
// can therefore disagree for a holding with a missing cadence; owner-confirmed as the accepted
// trade-off, on the reasoning that the conservative reading is the right one to show here.
function annualisePremium(amount: unknown, frequency: unknown): number | null {
  // Same NaN guard as scenarios.ts's `num()` — `characteristics` is Record<string, unknown>,
  // so any field can be absent, a string, or junk.
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) return null;
  if (typeof frequency !== 'string') return null;

  const freq = frequency.trim().toLowerCase();
  if (!RECURRING_FREQUENCIES.has(freq)) return null;

  if (freq === 'annual' || freq === 'annually' || freq === 'yearly' || freq === 'year') {
    return value;
  }
  if (freq === 'quarterly' || freq === 'quarter') return value * 4;
  if (freq === 'weekly' || freq === 'week') return value * 52;
  // Only 'monthly'/'month' can reach here — the recognised-set gate above rejects everything else.
  return value * 12;
}

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
        // The schema stores `premium` + `premium_frequency` (characteristicsSchema.ts) — there is
        // no pre-annualised field, so the cadence has to be applied here.
        annual80C += annualisePremium(
          h.characteristics.premium,
          h.characteristics.premium_frequency
        ) ?? 0;
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
