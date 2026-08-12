export type CreditCardPayoffOutcome =
  | { kind: 'paid_off'; months: number; totalPaid: number; totalInterest: number; finalPayment: number }
  | { kind: 'non_clearing' }
  | { kind: 'capped' }
  | { kind: 'invalid'; reason: 'non_finite' | 'balance' | 'rate' | 'payment' | 'unsafe' };

const MAX_AMOUNT = 1_000_000_000_000;
const MAX_RATE = 1_000;
export const PAYOFF_MONTH_CAP = 1200;

export function calculateCreditCardPayoff(balance: number, annualRatePercent: number, monthlyPayment: number): CreditCardPayoffOutcome {
  if (![balance, annualRatePercent, monthlyPayment].every(Number.isFinite)) return { kind: 'invalid', reason: 'non_finite' };
  if (balance <= 0) return { kind: 'invalid', reason: 'balance' };
  if (annualRatePercent < 0 || annualRatePercent > MAX_RATE) return { kind: 'invalid', reason: 'rate' };
  if (monthlyPayment <= 0) return { kind: 'invalid', reason: 'payment' };
  if (balance > MAX_AMOUNT || monthlyPayment > MAX_AMOUNT) return { kind: 'invalid', reason: 'unsafe' };

  const monthlyRate = annualRatePercent / 12 / 100;
  if (balance * monthlyRate >= monthlyPayment) return { kind: 'non_clearing' };
  let remaining = balance;
  let totalPaid = 0;
  let totalInterest = 0;
  let finalPayment = 0;
  for (let month = 1; month <= PAYOFF_MONTH_CAP; month += 1) {
    const interest = remaining * monthlyRate;
    const amountDue = remaining + interest;
    const payment = Math.min(monthlyPayment, amountDue);
    if (![interest, amountDue, payment].every(Number.isFinite)) return { kind: 'invalid', reason: 'unsafe' };
    totalInterest += interest;
    totalPaid += payment;
    remaining = amountDue - payment;
    if (remaining <= 1e-8) return { kind: 'paid_off', months: month, totalPaid, totalInterest, finalPayment: payment };
  }
  return { kind: 'capped' };
}
