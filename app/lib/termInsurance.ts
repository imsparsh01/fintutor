import type { GoalRecord } from './goals';
import type { Holding } from './holdings';

export type TermInsuranceComponentKind = 'debt' | 'goal' | 'asset';

export interface TermInsuranceComponent {
  id: string;
  kind: TermInsuranceComponentKind;
  label: string;
  amount: number;
  source: string;
  included: boolean;
}

export interface TermInsuranceStream {
  annualAmount: number;
  years: number;
  growthPercent?: number;
}

export interface TermInsuranceInputs {
  householdSupport: TermInsuranceStream;
  survivorIncome: TermInsuranceStream | null;
  components: TermInsuranceComponent[];
  existingIndividualCover: number;
  existingGroupCover: number;
  existingOtherCover: number;
}

export interface TermInsuranceResult {
  householdSupportStream: number;
  selectedDebts: number;
  selectedGoals: number;
  selectedAssetOffsets: number;
  survivorIncomeStream: number;
  modeledAmount: number;
  existingIndividualCover: number;
  existingGroupCover: number;
  existingOtherCover: number;
  enteredCoverTotal: number;
  signedCoverDifference: number;
}

const LOAN_TYPES = new Set(['home_loan', 'personal_loan', 'credit_card_debt']);
const ASSET_FIELDS: Record<string, string> = {
  equity_mutual_fund: 'current_value',
  debt_mutual_fund: 'current_value',
  stocks: 'current_value',
  fd_rd: 'principal_or_monthly_amount',
  ppf_epf: 'current_balance',
};
const MAX_SAFE_AMOUNT = Number.MAX_SAFE_INTEGER;

function finiteNonNegative(raw: unknown): number | null {
  if (typeof raw === 'boolean' || raw === null || raw === '') return null;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 && value <= MAX_SAFE_AMOUNT ? value : null;
}

function sourceLabel(holding: Holding): string {
  return holding.display_name ?? holding.alias;
}

export function recordedTermInsuranceContext(
  holdings: Holding[],
  goals: GoalRecord[],
): { components: TermInsuranceComponent[]; individualCover: number; individualCoverSources: string[] } {
  const components: TermInsuranceComponent[] = [];
  let individualCover = 0;
  const individualCoverSources: string[] = [];

  for (const holding of holdings) {
    const label = sourceLabel(holding);
    if (LOAN_TYPES.has(holding.product_type)) {
      const amount = finiteNonNegative(holding.characteristics.outstanding_balance);
      if (amount !== null) components.push({
        id: `holding:${holding.id}:debt`, kind: 'debt', label, amount,
        source: 'Recorded loan balance', included: true,
      });
    }

    const assetField = ASSET_FIELDS[holding.product_type];
    // The shared FD/RD amount means principal for an FD but a recurring instalment for
    // an RD. Treating an RD instalment as a survivor-available asset would subtract the
    // wrong quantity from this financial model, so only confirmed FDs are prefilled.
    const isAvailableAsset = holding.product_type !== 'fd_rd'
      || String(holding.characteristics.deposit_mode ?? '').toUpperCase() === 'FD';
    if (assetField && isAvailableAsset) {
      const amount = finiteNonNegative(holding.characteristics[assetField]);
      if (amount !== null) components.push({
        id: `holding:${holding.id}:asset`, kind: 'asset', label, amount,
        source: 'Recorded holding value — include only if available to survivors', included: false,
      });
    }

    if (holding.product_type === 'term_insurance') {
      const amount = finiteNonNegative(holding.characteristics.sum_assured);
      if (amount !== null) {
        individualCover += amount;
        individualCoverSources.push(`${label} · recorded sum assured`);
      } else {
        individualCoverSources.push(`${label} · sum assured needs confirmation`);
      }
    }
  }

  for (const goal of goals) {
    const amount = finiteNonNegative(goal.target_amount);
    if (amount !== null) components.push({
      id: `goal:${goal.id}`, kind: 'goal', label: goal.category, amount,
      source: 'Recorded goal target', included: true,
    });
  }

  return { components, individualCover, individualCoverSources };
}

function streamValue(stream: TermInsuranceStream): number | null {
  const annual = finiteNonNegative(stream.annualAmount);
  const growth = stream.growthPercent === undefined ? 0 : finiteNonNegative(stream.growthPercent);
  if (annual === null || growth === null || growth > 100) return null;
  if (!Number.isInteger(stream.years) || stream.years < 1 || stream.years > 100) return null;
  let total = 0;
  let factor = 1;
  const rate = growth / 100;
  for (let year = 0; year < stream.years; year += 1) {
    total += annual * factor;
    factor *= 1 + rate;
    if (!Number.isFinite(total) || total > MAX_SAFE_AMOUNT || !Number.isFinite(factor)) return null;
  }
  return total;
}

export function calculateTermInsuranceExploration(inputs: TermInsuranceInputs): TermInsuranceResult | null {
  const householdSupportStream = streamValue(inputs.householdSupport);
  const survivorIncomeStream = inputs.survivorIncome === null ? 0 : streamValue(inputs.survivorIncome);
  if (householdSupportStream === null || survivorIncomeStream === null) return null;

  const covers = [inputs.existingIndividualCover, inputs.existingGroupCover, inputs.existingOtherCover];
  if (covers.some((value) => finiteNonNegative(value) === null)) return null;

  const selected = inputs.components.filter((component) => component.included);
  if (selected.some((component) => finiteNonNegative(component.amount) === null)) return null;
  const sumKind = (kind: TermInsuranceComponentKind) => selected
    .filter((component) => component.kind === kind)
    .reduce((total, component) => total + component.amount, 0);
  const selectedDebts = sumKind('debt');
  const selectedGoals = sumKind('goal');
  const selectedAssetOffsets = sumKind('asset');
  const rawModeled = householdSupportStream + selectedDebts + selectedGoals
    - selectedAssetOffsets - survivorIncomeStream;
  const enteredCoverTotal = covers.reduce((total, value) => total + value, 0);
  if (![selectedDebts, selectedGoals, selectedAssetOffsets, rawModeled, enteredCoverTotal]
    .every((value) => Number.isFinite(value) && Math.abs(value) <= MAX_SAFE_AMOUNT)) return null;
  const modeledAmount = Math.max(0, rawModeled);

  return {
    householdSupportStream,
    selectedDebts,
    selectedGoals,
    selectedAssetOffsets,
    survivorIncomeStream,
    modeledAmount,
    existingIndividualCover: inputs.existingIndividualCover,
    existingGroupCover: inputs.existingGroupCover,
    existingOtherCover: inputs.existingOtherCover,
    enteredCoverTotal,
    signedCoverDifference: enteredCoverTotal - modeledAmount,
  };
}
