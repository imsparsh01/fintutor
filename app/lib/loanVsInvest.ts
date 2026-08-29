import { authenticatedFetch, BACKEND_URL } from './backend';

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
  source_evidence: {
    source_kind: 'holding';
    source_record_id: string;
    source_label: string;
    source_fields: string[];
    source_version: number;
    record_updated_at: null;
    retrieved_at: string;
    freshness: 'unavailable';
    freshness_note: 'Freshness unavailable';
  };
}

// D-067 (user-triggered detection) + D-068 (hurdle-rate-only math, BRIEF-014).
export async function fetchLoanVsInvest(
  userId: string,
  holdingId: string,
  prepayAmount: number
): Promise<LoanVsInvestResult> {
  const res = await authenticatedFetch(`${BACKEND_URL}/loan-vs-invest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ holding_id: holdingId, prepay_amount: prepayAmount }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail ?? `Backend responded ${res.status}`);
  }
  return (await res.json()) as LoanVsInvestResult;
}
