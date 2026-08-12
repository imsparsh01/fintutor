import type { GoalFundingRecord } from './goals';

const AMOUNT_PATTERN = /^(?:\d{1,12})(?:\.\d{1,2})?$/;

export function fundingAmountsValid(items: GoalFundingRecord[]): boolean {
  return items.every((item) => {
    const raw = String(item.earmarked_amount);
    return Number.isFinite(item.earmarked_amount) && item.earmarked_amount > 0 && AMOUNT_PATTERN.test(raw);
  });
}
