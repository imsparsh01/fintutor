const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? 'http://localhost:8000';

// D-068 scopes this comparison to fixed-EMI Home and Personal Loans. Keep the
// predicate shared by every launcher so Tools and holding detail cannot drift.
const ELIGIBLE_LOAN_TYPES = new Set(['home_loan', 'personal_loan']);

export function isLoanVsInvestEligible(productType: string): boolean {
  return ELIGIBLE_LOAN_TYPES.has(productType);
}

export interface LoanVsInvestResult {
  holding_id: string;
  prepay_amount: number;
  hurdle_rate_percent: number;
  hurdle_rate_note: string;
  tenure_reduction: { new_remaining_months: number; interest_saved: number };
  emi_reduction: { new_emi_amount: number; interest_saved: number };
  prepayment_charge_note: string;
}

// D-067 (user-triggered detection) + D-068 (hurdle-rate-only math, BRIEF-014).
export async function fetchLoanVsInvest(
  userId: string,
  holdingId: string,
  prepayAmount: number
): Promise<LoanVsInvestResult> {
  const params = new URLSearchParams({
    user_id: userId,
    holding_id: holdingId,
    prepay_amount: String(prepayAmount),
  });
  const res = await fetch(`${BACKEND_URL}/loan-vs-invest?${params.toString()}`);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail ?? `Backend responded ${res.status}`);
  }
  return (await res.json()) as LoanVsInvestResult;
}
