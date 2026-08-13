export type StepUpSipResult = { corpus: number; invested: number };

// D-129: contributions land at month end, after that month's growth. The first
// contribution of each new 12-month block uses that block's stepped-up amount.
export function calculateStepUpSip(
  startingMonthlyContribution: number,
  annualStepUpRate: number,
  annualReturnRate: number,
  years: number,
): StepUpSipResult | null {
  if (
    !Number.isFinite(startingMonthlyContribution) || startingMonthlyContribution <= 0 ||
    !Number.isFinite(annualStepUpRate) || annualStepUpRate < 0 ||
    !Number.isFinite(annualReturnRate) || annualReturnRate <= 0 ||
    !Number.isInteger(years) || years <= 0
  ) return null;

  const monthlyRate = annualReturnRate / 12 / 100;
  const annualStep = annualStepUpRate / 100;
  let corpus = 0;
  let currentContribution = startingMonthlyContribution;
  let invested = 0;

  for (let year = 0; year < years; year++) {
    for (let month = 0; month < 12; month++) {
      corpus = corpus * (1 + monthlyRate) + currentContribution;
      invested += currentContribution;
    }
    currentContribution *= 1 + annualStep;
  }

  if (!Number.isFinite(corpus) || !Number.isFinite(invested)) return null;
  return { corpus, invested };
}
