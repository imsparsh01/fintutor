// D-013's MVP product-type taxonomy (8 original types + ESOP, D-055), grouped by the
// three MVP holding families (D-031). String literals mirror the ones already used in
// backend/app/services/budget.py and surfacing.py.
export const INVESTMENT_TYPES = [
  'equity_mutual_fund',
  'debt_mutual_fund',
  'stocks',
  'fd_rd',
  'ppf_epf',
  'esop',
];

export const LOAN_TYPES = ['home_loan', 'personal_loan', 'credit_card_debt'];

export const INSURANCE_TYPES = ['term_insurance', 'endowment_ulip'];

// Flat list for the recategorize picker (D-059) — unconstrained on the backend (D-044), but
// the UI offers the known taxonomy rather than free text to avoid silent typos/new types.
export const ALL_PRODUCT_TYPES = [...INVESTMENT_TYPES, ...LOAN_TYPES, ...INSURANCE_TYPES];

export function humanizeProductType(productType: string): string {
  return productType
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
