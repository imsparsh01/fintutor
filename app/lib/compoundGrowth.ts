export type CompoundGrowthResult = { endingAmount: number; totalContributed: number; arithmeticDifference: number; months: number };
export type CompoundGrowthError = 'non_finite' | 'amount_required' | 'negative_value' | 'amount_too_large' | 'rate_out_of_range' | 'horizon_out_of_range' | 'horizon_rounds_to_zero' | 'numeric_overflow';
export type CompoundGrowthOutcome = { ok: true; result: CompoundGrowthResult } | { ok: false; error: CompoundGrowthError };
const MAX_AMOUNT = 1_000_000_000_000;
const MAX_RATE_PERCENT = 1_000;
const MAX_YEARS = 200;

export function calculateCompoundGrowth(lumpSum: number, monthlyContribution: number, annualRatePercent: number, years: number): CompoundGrowthOutcome {
  if (![lumpSum, monthlyContribution, annualRatePercent, years].every(Number.isFinite)) return { ok: false, error: 'non_finite' };
  if (lumpSum < 0 || monthlyContribution < 0 || annualRatePercent < 0 || years < 0) return { ok: false, error: 'negative_value' };
  if (lumpSum === 0 && monthlyContribution === 0) return { ok: false, error: 'amount_required' };
  if (lumpSum > MAX_AMOUNT || monthlyContribution > MAX_AMOUNT) return { ok: false, error: 'amount_too_large' };
  if (annualRatePercent > MAX_RATE_PERCENT) return { ok: false, error: 'rate_out_of_range' };
  if (years > MAX_YEARS) return { ok: false, error: 'horizon_out_of_range' };
  const months = Math.round(12 * years);
  if (months < 1) return { ok: false, error: 'horizon_rounds_to_zero' };
  if (months > MAX_YEARS * 12) return { ok: false, error: 'horizon_out_of_range' };
  const monthlyRate = annualRatePercent / 12 / 100;
  const growthFactor = Math.pow(1 + monthlyRate, months);
  const endingAmount = monthlyRate === 0 ? lumpSum + monthlyContribution * months : lumpSum * growthFactor + monthlyContribution * ((growthFactor - 1) / monthlyRate);
  const totalContributed = lumpSum + monthlyContribution * months;
  const arithmeticDifference = endingAmount - totalContributed;
  if (![endingAmount, totalContributed, arithmeticDifference].every(Number.isFinite) || endingAmount > Number.MAX_SAFE_INTEGER || totalContributed > Number.MAX_SAFE_INTEGER) return { ok: false, error: 'numeric_overflow' };
  return { ok: true, result: { endingAmount, totalContributed, arithmeticDifference, months } };
}
