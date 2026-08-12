import type { BudgetSummary } from './budget';
import type { Holding } from './holdings';

export interface EmergencyCoverageInputs {
  cashAndBank: number;
  fixedDeposits: number;
  otherAccessible: number;
  monthlyOutgoings: number;
}

export interface EmergencyCoverageResult {
  accessibleBalances: number;
  months: number;
}

function finiteNonNegative(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function emergencyBudgetPrefill(budget: BudgetSummary): number {
  return finiteNonNegative(budget.recurring_outflows_total) + finiteNonNegative(budget.discretionary_total);
}

export function emergencyFixedDepositPrefill(holdings: Holding[]): number {
  return holdings.reduce((total, holding) => {
    if (holding.product_type !== 'fd_rd') return total;
    const isRecurring = String(holding.characteristics.deposit_mode ?? '').toUpperCase() === 'RD';
    return isRecurring
      ? total
      : total + finiteNonNegative(holding.characteristics.principal_or_monthly_amount);
  }, 0);
}

export function calculateEmergencyCoverage(
  inputs: EmergencyCoverageInputs
): EmergencyCoverageResult | null {
  const values = Object.values(inputs);
  if (!values.every(Number.isFinite)) return null;
  if (inputs.cashAndBank < 0 || inputs.fixedDeposits < 0 || inputs.otherAccessible < 0) return null;
  if (!(inputs.monthlyOutgoings > 0)) return null;
  const accessibleBalances = inputs.cashAndBank + inputs.fixedDeposits + inputs.otherAccessible;
  return { accessibleBalances, months: accessibleBalances / inputs.monthlyOutgoings };
}

// Stable identity for one committed calculation. UI surfaces keep their own last-emitted
// signature, so an identical re-render cannot award twice while S-05 and C-14 remain separate.
export function emergencyCoverageSignature(inputs: EmergencyCoverageInputs): string {
  return [inputs.cashAndBank, inputs.fixedDeposits, inputs.otherAccessible, inputs.monthlyOutgoings]
    .map((value) => String(value))
    .join('|');
}

export function emergencyPrefillWhenUntouched(touched: boolean, prefill: number): number | null {
  return touched ? null : prefill;
}

export function shouldEmitEmergencyCoverage(
  lastEmittedSignature: string | null,
  committedSignature: string
): boolean {
  return lastEmittedSignature !== committedSignature;
}
