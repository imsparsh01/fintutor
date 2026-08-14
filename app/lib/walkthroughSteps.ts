import type { WalkthroughStep } from '../components/TeachingWalkthrough';

type WalkthroughHolding = {
  product_type: string;
  alias: string;
  display_name: string | null;
  characteristics: Record<string, unknown>;
};

export type WalkthroughFamily = 'investments' | 'loans' | 'insurance';

export type WalkthroughPlan = {
  steps: WalkthroughStep[];
  missingQuestion: string | null;
};

type Field = { key: string; label: string; money?: boolean; suffix?: string };

const FIELDS: Record<string, Field[]> = {
  equity_mutual_fund: [
    { key: 'investment_mode', label: 'Investment mode' },
    { key: 'current_value', label: 'Current value', money: true },
    { key: 'expense_ratio', label: 'Expense ratio', suffix: '%' },
  ],
  debt_mutual_fund: [
    { key: 'investment_mode', label: 'Investment mode' },
    { key: 'current_value', label: 'Current value', money: true },
    { key: 'expense_ratio', label: 'Expense ratio', suffix: '%' },
  ],
  stocks: [
    { key: 'invested_amount', label: 'Amount invested', money: true },
    { key: 'current_value', label: 'Current value', money: true },
    { key: 'risk_bucket', label: 'Recorded risk bucket' },
  ],
  fd_rd: [
    { key: 'deposit_mode', label: 'Deposit mode' },
    { key: 'interest_rate', label: 'Interest rate', suffix: '%' },
    { key: 'maturity_date', label: 'Maturity date' },
  ],
  ppf_epf: [
    { key: 'retirement_fund_type', label: 'Fund type' },
    { key: 'current_balance', label: 'Current balance', money: true },
    { key: 'annual_contribution', label: 'Annual contribution', money: true },
  ],
  esop: [
    { key: 'grant_type', label: 'Grant type' },
    { key: 'total_units_granted', label: 'Units granted' },
    { key: 'vesting_period_months', label: 'Vesting period', suffix: ' months' },
  ],
  home_loan: [
    { key: 'outstanding_balance', label: 'Outstanding balance', money: true },
    { key: 'interest_rate', label: 'Interest rate', suffix: '%' },
    { key: 'emi_amount', label: 'EMI', money: true },
  ],
  personal_loan: [
    { key: 'outstanding_balance', label: 'Outstanding balance', money: true },
    { key: 'interest_rate', label: 'Interest rate', suffix: '%' },
    { key: 'emi_amount', label: 'EMI', money: true },
  ],
  credit_card_debt: [
    { key: 'outstanding_balance', label: 'Outstanding balance', money: true },
    { key: 'interest_rate', label: 'Interest rate', suffix: '%' },
    { key: 'minimum_due', label: 'Minimum due', money: true },
  ],
  term_insurance: [
    { key: 'sum_assured', label: 'Recorded cover', money: true },
    { key: 'premium', label: 'Premium', money: true },
    { key: 'policy_term', label: 'Policy term' },
  ],
  endowment_ulip: [
    { key: 'sum_assured', label: 'Recorded cover', money: true },
    { key: 'premium', label: 'Premium', money: true },
    { key: 'current_fund_value', label: 'Current fund value', money: true },
  ],
};

const FAMILY_MECHANISM: Record<WalkthroughFamily, string> = {
  investments: 'These recorded fields show how value enters, changes, and becomes accessible. They describe mechanisms; they do not rank the holdings.',
  loans: 'Balance, rate, and payment describe how an obligation changes over time. They do not decide whether changing the loan is suitable.',
  insurance: 'Cover, premium, term, and any savings layer are separate parts of the contract. Seeing them together explains the structure without judging it.',
};

function isKnown(value: unknown, field: Field): value is string | number {
  if (field.money || field.suffix === '%' || field.suffix === ' months') {
    return typeof value === 'number' && Number.isFinite(value);
  }
  return (typeof value === 'number' && Number.isFinite(value))
    || (typeof value === 'string' && value.trim().length > 0);
}

function displayValue(value: string | number, field: Field): string {
  if (field.money && typeof value === 'number') {
    return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  }
  return `${value}${field.suffix ?? ''}`;
}

function productLabel(productType: string): string {
  return productType.split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

export function buildWalkthroughPlan(
  family: WalkthroughFamily,
  holdings: WalkthroughHolding[],
): WalkthroughPlan {
  if (holdings.length === 0) {
    return {
      steps: [{
        title: 'Start with one real record',
        body: `There are no ${family} recorded yet, so FinTutor will not invent an example or treat unknown amounts as zero. Add one only if you want an own-numbers walkthrough.`,
        missing: [`One ${family} record`],
      }],
      missingQuestion: `Help me record one ${family} item for an own-numbers walkthrough. Ask only for the necessary details and show me everything before saving.`,
    };
  }

  const missingPrompts: string[] = [];
  const steps = holdings.map((holding): WalkthroughStep => {
    const fields = FIELDS[holding.product_type] ?? [];
    const figures: { label: string; value: string }[] = [];
    const missing: string[] = [];
    for (const field of fields) {
      const value = holding.characteristics[field.key];
      if (isKnown(value, field)) figures.push({ label: field.label, value: displayValue(value, field) });
      else missing.push(field.label);
    }
    const recordName = holding.display_name ?? holding.alias;
    if (missing.length > 0) missingPrompts.push(`${recordName}: ${missing.join(', ')}`);
    return {
      title: recordName,
      body: `${productLabel(holding.product_type)}. ${FAMILY_MECHANISM[family]}`,
      source: `your saved ${family} record`,
      figures,
      missing,
    };
  });

  return {
    steps,
    missingQuestion: missingPrompts.length > 0
      ? `For this ${family} walkthrough, ask me only for these unrecorded details: ${missingPrompts.join('; ')}. Do not save anything until I confirm the proposed changes.`
      : null,
  };
}
