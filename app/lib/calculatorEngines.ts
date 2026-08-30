export const MAX_CALCULATOR_AMOUNT = 1_000_000_000_000;
export const MAX_CALCULATOR_RATE_PERCENT = 1_000;
export const MAX_CALCULATOR_YEARS = 200;

const safe = (...values: number[]) =>
  values.every((value) => Number.isFinite(value) && Math.abs(value) <= Number.MAX_SAFE_INTEGER);

export type CalculatorEngineOutcome<T> =
  | { ok: true; result: T }
  | { ok: false; error: 'non_finite' | 'domain' | 'overflow' };

export function calculateSipGoal(target: number, annualRatePercent: number, years: number): CalculatorEngineOutcome<{ monthlyContribution: number; months: number }> {
  if (![target, annualRatePercent, years].every(Number.isFinite)) return { ok: false, error: 'non_finite' };
  const months = Math.round(years * 12);
  if (!(target > 0 && target <= MAX_CALCULATOR_AMOUNT) || annualRatePercent < 0 || annualRatePercent > MAX_CALCULATOR_RATE_PERCENT || months < 1 || months > 2400) return { ok: false, error: 'domain' };
  const monthlyRate = annualRatePercent / 1200;
  const contributionFactor = monthlyRate === 0 ? months : Math.expm1(months * Math.log1p(monthlyRate)) / monthlyRate;
  const monthlyContribution = target / contributionFactor;
  return safe(contributionFactor, monthlyContribution) ? { ok: true, result: { monthlyContribution, months } } : { ok: false, error: 'overflow' };
}

export function calculateHomeLoanEmi(principal: number, annualRatePercent: number, years: number): CalculatorEngineOutcome<{ emi: number; totalInterest: number; months: number }> {
  if (![principal, annualRatePercent, years].every(Number.isFinite)) return { ok: false, error: 'non_finite' };
  const months = Math.round(years * 12);
  if (!(principal > 0 && principal <= MAX_CALCULATOR_AMOUNT) || annualRatePercent < 0 || annualRatePercent > MAX_CALCULATOR_RATE_PERCENT || months < 1 || months > 600) return { ok: false, error: 'domain' };
  const monthlyRate = annualRatePercent / 1200;
  const growth = Math.exp(months * Math.log1p(monthlyRate));
  const emi = monthlyRate === 0 ? principal / months : principal * monthlyRate * growth / (growth - 1);
  const totalInterest = emi * months - principal;
  return safe(growth, emi, totalInterest) ? { ok: true, result: { emi, totalInterest, months } } : { ok: false, error: 'overflow' };
}

export function calculateInflationImpact(presentCost: number, annualRatePercent: number, years: number): CalculatorEngineOutcome<{ futureCost: number }> {
  if (![presentCost, annualRatePercent, years].every(Number.isFinite)) return { ok: false, error: 'non_finite' };
  if (!(presentCost > 0 && presentCost <= MAX_CALCULATOR_AMOUNT) || annualRatePercent < -100 || annualRatePercent > MAX_CALCULATOR_RATE_PERCENT || years < 0 || years > MAX_CALCULATOR_YEARS) return { ok: false, error: 'domain' };
  const futureCost = presentCost * Math.pow(1 + annualRatePercent / 100, years);
  return safe(futureCost) ? { ok: true, result: { futureCost } } : { ok: false, error: 'overflow' };
}

export function calculateCagr(initialValue: number, finalValue: number, years: number): CalculatorEngineOutcome<{ annualRatePercent: number }> {
  if (![initialValue, finalValue, years].every(Number.isFinite)) return { ok: false, error: 'non_finite' };
  if (!(initialValue > 0 && initialValue <= MAX_CALCULATOR_AMOUNT) || !(finalValue > 0 && finalValue <= MAX_CALCULATOR_AMOUNT) || !(years > 0 && years <= MAX_CALCULATOR_YEARS)) return { ok: false, error: 'domain' };
  const annualRatePercent = Math.expm1(Math.log(finalValue / initialValue) / years) * 100;
  return safe(annualRatePercent) ? { ok: true, result: { annualRatePercent } } : { ok: false, error: 'overflow' };
}
