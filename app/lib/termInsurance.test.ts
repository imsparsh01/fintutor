// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateTermInsuranceExploration, recordedTermInsuranceContext } from './termInsurance.ts';

const base = {
  householdSupport: { annualAmount: 600000, years: 10 },
  survivorIncome: null,
  components: [],
  existingIndividualCover: 2000000,
  existingGroupCover: 500000,
  existingOtherCover: 0,
};

test('uses the exact component formula and reports cover separately', () => {
  const result = calculateTermInsuranceExploration({ ...base, components: [
    { id: 'd', kind: 'debt', label: 'Debt', amount: 1000000, source: 'recorded', included: true },
    { id: 'g', kind: 'goal', label: 'Goal', amount: 500000, source: 'recorded', included: true },
    { id: 'a', kind: 'asset', label: 'Asset', amount: 750000, source: 'recorded', included: true },
  ] });
  assert.equal(result?.householdSupportStream, 6000000);
  assert.equal(result?.modeledAmount, 6750000);
  assert.equal(result?.enteredCoverTotal, 2500000);
  assert.equal(result?.signedCoverDifference, -4250000);
});

test('growth applies annually from year zero and no rate is inferred', () => {
  const noGrowth = calculateTermInsuranceExploration({ ...base, householdSupport: { annualAmount: 100, years: 3 } });
  const growth = calculateTermInsuranceExploration({ ...base, householdSupport: { annualAmount: 100, years: 3, growthPercent: 10 } });
  assert.equal(noGrowth?.householdSupportStream, 300);
  assert.equal(growth?.householdSupportStream, 331);
});

test('selected survivor income offsets the model and amount clamps at zero', () => {
  const result = calculateTermInsuranceExploration({
    ...base,
    householdSupport: { annualAmount: 100, years: 1 },
    survivorIncome: { annualAmount: 200, years: 1 },
  });
  assert.equal(result?.modeledAmount, 0);
});

test('invalid, unknown, out-of-range and overflowing critical inputs block calculation', () => {
  assert.equal(calculateTermInsuranceExploration({ ...base, householdSupport: { annualAmount: NaN, years: 10 } }), null);
  assert.equal(calculateTermInsuranceExploration({ ...base, householdSupport: { annualAmount: 1, years: 0 } }), null);
  assert.equal(calculateTermInsuranceExploration({ ...base, householdSupport: { annualAmount: 1, years: 101 } }), null);
  assert.equal(calculateTermInsuranceExploration({ ...base, householdSupport: { annualAmount: 1, years: 2, growthPercent: 101 } }), null);
  assert.equal(calculateTermInsuranceExploration({ ...base, existingGroupCover: -1 }), null);
  assert.equal(calculateTermInsuranceExploration({ ...base, householdSupport: { annualAmount: Number.MAX_VALUE, years: 100, growthPercent: 100 } }), null);
});

test('excluded components do not need valid amounts but included ones do', () => {
  const component = { id: 'x', kind: 'asset', label: 'Asset', amount: NaN, source: 'recorded', included: false };
  assert.ok(calculateTermInsuranceExploration({ ...base, components: [component] }));
  assert.equal(calculateTermInsuranceExploration({ ...base, components: [{ ...component, included: true }] }), null);
});

test('context prefills expose sources and every recorded component starts excluded', () => {
  const holdings = [
    { id: 'l', product_type: 'home_loan', alias: 'Loan-A', display_name: null, characteristics: { outstanding_balance: 1000 } },
    { id: 'a', product_type: 'fd_rd', alias: 'FD-A', display_name: 'Deposit', characteristics: { deposit_mode: 'FD', principal_or_monthly_amount: 500 } },
    { id: 't', product_type: 'term_insurance', alias: 'Policy-A', display_name: null, characteristics: { sum_assured: 2000 } },
  ];
  const goals = [{ id: 'g', category: 'Education', target_amount: 3000 }];
  const context = recordedTermInsuranceContext(holdings, goals);
  assert.deepEqual(context.components.map(({ kind, included, source }) => ({ kind, included, source })), [
    { kind: 'debt', included: false, source: 'Recorded loan balance' },
    { kind: 'asset', included: false, source: 'Recorded holding value — include only if available to survivors' },
    { kind: 'goal', included: false, source: 'Recorded goal target' },
  ]);
  assert.deepEqual(context.components.map(({ sourceRecordId, sourceVersion, sourceFields }) => ({ sourceRecordId, sourceVersion, sourceFields })), [
    { sourceRecordId: 'l', sourceVersion: undefined, sourceFields: ['outstanding_balance'] },
    { sourceRecordId: 'a', sourceVersion: undefined, sourceFields: ['principal_or_monthly_amount'] },
    { sourceRecordId: 'g', sourceVersion: undefined, sourceFields: ['target_amount'] },
  ]);
  assert.equal(context.individualCover, 2000);
  assert.deepEqual(context.individualCoverSources, ['Policy-A · recorded sum assured']);
});

test('malformed recorded values are not converted into zero-value prefills', () => {
  const context = recordedTermInsuranceContext([
    { id: 'x', product_type: 'home_loan', alias: 'Loan-X', characteristics: { outstanding_balance: 'unknown' } },
  ], []);
  assert.equal(context.components.length, 0);
});

test('RD instalments are never prefilled as available asset balances', () => {
  const context = recordedTermInsuranceContext([
    { id: 'rd', product_type: 'fd_rd', alias: 'RD-A', characteristics: { deposit_mode: 'RD', principal_or_monthly_amount: 5000 } },
    { id: 'fd', product_type: 'fd_rd', alias: 'FD-A', characteristics: { deposit_mode: 'FD', principal_or_monthly_amount: 50000 } },
  ], []);
  assert.deepEqual(context.components.map(({ label, amount }) => ({ label, amount })), [{ label: 'FD-A', amount: 50000 }]);
});

test('amounts beyond safe integer precision are rejected', () => {
  assert.equal(calculateTermInsuranceExploration({ ...base, existingOtherCover: Number.MAX_SAFE_INTEGER + 1 }), null);
});
