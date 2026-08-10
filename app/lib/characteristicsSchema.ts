// D-013's per-type characteristic fields, transcribed for form rendering.
// `esop`'s fields come from D-066 (applying D-013's split-vs-merge test to D-055's
// taxonomy addition) — single type, `grant_type` distinguishes options from RSUs.
export interface FieldSpec {
  key: string;
  label: string;
  kind: 'text' | 'number' | 'date' | 'enum';
  options?: string[];
}

const DATE_HINT = ' (YYYY-MM-DD)';

const FUND_FIELDS: FieldSpec[] = [
  { key: 'expense_ratio', label: 'Expense ratio (%)', kind: 'number' },
  { key: 'lock_in_period', label: 'Lock-in period', kind: 'text' },
  { key: 'investment_mode', label: 'Investment mode', kind: 'enum', options: ['SIP', 'lumpsum'] },
  { key: 'invested_amount', label: 'Invested amount (₹)', kind: 'number' },
  { key: 'sip_frequency', label: 'SIP frequency', kind: 'text' },
  { key: 'current_value', label: 'Current value (₹)', kind: 'number' },
  { key: 'start_date', label: `Start date${DATE_HINT}`, kind: 'date' },
  { key: 'risk_bucket', label: 'Risk bucket', kind: 'text' },
];

const LOAN_FIELDS: FieldSpec[] = [
  { key: 'principal', label: 'Principal (₹)', kind: 'number' },
  { key: 'interest_rate', label: 'Interest rate (%)', kind: 'number' },
  { key: 'tenure_months', label: 'Tenure (months)', kind: 'number' },
  { key: 'emi_amount', label: 'EMI amount (₹)', kind: 'number' },
  { key: 'emi_frequency', label: 'EMI frequency', kind: 'text' },
  { key: 'emi_due_day', label: 'EMI due day (1–31)', kind: 'number' },
  { key: 'start_date', label: `Start date${DATE_HINT}`, kind: 'date' },
  { key: 'outstanding_balance', label: 'Outstanding balance (₹)', kind: 'number' },
];

export const CHARACTERISTICS_SCHEMA: Record<string, FieldSpec[]> = {
  equity_mutual_fund: FUND_FIELDS,
  debt_mutual_fund: FUND_FIELDS,
  stocks: [
    { key: 'sector', label: 'Sector', kind: 'text' },
    { key: 'invested_amount', label: 'Invested amount (₹)', kind: 'number' },
    { key: 'current_value', label: 'Current value (₹)', kind: 'number' },
    { key: 'purchase_date', label: `Purchase date${DATE_HINT}`, kind: 'date' },
    { key: 'risk_bucket', label: 'Risk bucket', kind: 'text' },
  ],
  fd_rd: [
    { key: 'deposit_mode', label: 'Deposit mode', kind: 'enum', options: ['FD', 'RD'] },
    { key: 'principal_or_monthly_amount', label: 'Principal / monthly amount (₹)', kind: 'number' },
    { key: 'interest_rate', label: 'Interest rate (%)', kind: 'number' },
    { key: 'tenure', label: 'Tenure', kind: 'text' },
    { key: 'maturity_date', label: `Maturity date${DATE_HINT}`, kind: 'date' },
  ],
  ppf_epf: [
    { key: 'retirement_fund_type', label: 'Fund type', kind: 'enum', options: ['PPF', 'EPF'] },
    { key: 'current_balance', label: 'Current balance (₹)', kind: 'number' },
    { key: 'annual_contribution', label: 'Annual contribution (₹)', kind: 'number' },
    { key: 'interest_rate', label: 'Interest rate (%)', kind: 'number' },
  ],
  home_loan: LOAN_FIELDS,
  personal_loan: LOAN_FIELDS,
  credit_card_debt: [
    { key: 'credit_limit', label: 'Credit limit (₹)', kind: 'number' },
    { key: 'outstanding_balance', label: 'Outstanding balance (₹)', kind: 'number' },
    { key: 'interest_rate', label: 'Interest rate (%)', kind: 'number' },
    { key: 'minimum_due', label: 'Minimum due (₹)', kind: 'number' },
    { key: 'payment_due_date', label: `Payment due date${DATE_HINT}`, kind: 'date' },
    { key: 'billing_cycle_date', label: `Billing cycle date${DATE_HINT}`, kind: 'date' },
  ],
  term_insurance: [
    { key: 'sum_assured', label: 'Sum assured (₹)', kind: 'number' },
    { key: 'premium', label: 'Premium (₹)', kind: 'number' },
    { key: 'premium_frequency', label: 'Premium frequency', kind: 'text' },
    { key: 'policy_term', label: 'Policy term', kind: 'text' },
    { key: 'start_date', label: `Start date${DATE_HINT}`, kind: 'date' },
  ],
  endowment_ulip: [
    { key: 'sum_assured', label: 'Sum assured (₹)', kind: 'number' },
    { key: 'premium', label: 'Premium (₹)', kind: 'number' },
    { key: 'premium_frequency', label: 'Premium frequency', kind: 'text' },
    { key: 'policy_term', label: 'Policy term', kind: 'text' },
    { key: 'current_fund_value', label: 'Current fund value (₹, ULIP only)', kind: 'number' },
    { key: 'maturity_value_estimate', label: 'Maturity value estimate (₹)', kind: 'number' },
    { key: 'start_date', label: `Start date${DATE_HINT}`, kind: 'date' },
  ],
  esop: [
    { key: 'grant_type', label: 'Grant type', kind: 'enum', options: ['options', 'rsu'] },
    { key: 'grant_date', label: `Grant date${DATE_HINT}`, kind: 'date' },
    { key: 'total_units_granted', label: 'Total units granted', kind: 'number' },
    { key: 'vesting_cliff_months', label: 'Vesting cliff (months)', kind: 'number' },
    { key: 'vesting_period_months', label: 'Total vesting period (months)', kind: 'number' },
    { key: 'strike_price', label: 'Strike price (₹ per unit, 0 for RSU)', kind: 'number' },
    { key: 'current_fmv', label: 'Current FMV (₹ per unit, if known)', kind: 'number' },
    { key: 'exercise_window_months', label: 'Post-termination exercise window (months)', kind: 'number' },
  ],
};
