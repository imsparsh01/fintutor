export type GoalAffordabilityResult = {
  endingValue: number;
  requiredMonthlyContribution: number;
  /** Planned monthly contribution minus modeled required monthly contribution. */
  monthlyContributionGap: number;
  months: number;
};

export type GoalAffordabilityError =
  | 'non_finite'
  | 'target_required'
  | 'negative_value'
  | 'amount_too_large'
  | 'rate_out_of_range'
  | 'horizon_out_of_range'
  | 'horizon_rounds_to_zero'
  | 'numeric_overflow';

export type GoalAffordabilityOutcome =
  | { ok: true; result: GoalAffordabilityResult }
  | { ok: false; error: GoalAffordabilityError };

const MAX_AMOUNT = 1_000_000_000_000;
const MAX_RATE_PERCENT = 1_000;
const MAX_YEARS = 200;

/** D-145's month-end goal-gap model. Every rate and amount comes from the user. */
export function calculateGoalAffordability(
  target: number,
  currentEarmarked: number,
  plannedMonthlyContribution: number,
  annualRatePercent: number,
  years: number
): GoalAffordabilityOutcome {
  const inputs = [target, currentEarmarked, plannedMonthlyContribution, annualRatePercent, years];
  if (!inputs.every(Number.isFinite)) return { ok: false, error: 'non_finite' };
  if (inputs.some((value) => value < 0)) return { ok: false, error: 'negative_value' };
  if (target === 0) return { ok: false, error: 'target_required' };
  if ([target, currentEarmarked, plannedMonthlyContribution].some((value) => value > MAX_AMOUNT)) {
    return { ok: false, error: 'amount_too_large' };
  }
  if (annualRatePercent > MAX_RATE_PERCENT) return { ok: false, error: 'rate_out_of_range' };
  if (years > MAX_YEARS) return { ok: false, error: 'horizon_out_of_range' };

  const months = Math.round(years * 12);
  if (months < 1) return { ok: false, error: 'horizon_rounds_to_zero' };
  if (months > MAX_YEARS * 12) return { ok: false, error: 'horizon_out_of_range' };

  const monthlyRate = annualRatePercent / 1200;
  let growthFactor: number;
  let contributionFactor: number;
  if (monthlyRate === 0) {
    growthFactor = 1;
    contributionFactor = months;
  } else {
    const growthMinusOne = Math.expm1(months * Math.log1p(monthlyRate));
    growthFactor = growthMinusOne + 1;
    contributionFactor = growthMinusOne / monthlyRate;
  }

  const grownCurrent = currentEarmarked * growthFactor;
  const endingValue = grownCurrent + plannedMonthlyContribution * contributionFactor;
  const requiredMonthlyContribution = Math.max(0, (target - grownCurrent) / contributionFactor);
  const monthlyContributionGap = plannedMonthlyContribution - requiredMonthlyContribution;
  if (
    ![growthFactor, contributionFactor, endingValue, requiredMonthlyContribution, monthlyContributionGap]
      .every(Number.isFinite)
    || endingValue > Number.MAX_SAFE_INTEGER
    || requiredMonthlyContribution > Number.MAX_SAFE_INTEGER
  ) return { ok: false, error: 'numeric_overflow' };

  return { ok: true, result: { endingValue, requiredMonthlyContribution, monthlyContributionGap, months } };
}
