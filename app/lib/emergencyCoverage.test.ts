// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateEmergencyCoverage,
  emergencyBudgetPrefill,
  emergencyCoverageSignature,
  emergencyFixedDepositPrefill,
  emergencyPrefillWhenUntouched,
  shouldEmitEmergencyCoverage,
} from './emergencyCoverage.ts';

test('cash-only, FD-only, and combined inputs use the same division mechanism', () => {
  assert.deepEqual(calculateEmergencyCoverage({ cashAndBank: 60000, fixedDeposits: 0, otherAccessible: 0, monthlyOutgoings: 30000 }), { accessibleBalances: 60000, months: 2 });
  assert.equal(calculateEmergencyCoverage({ cashAndBank: 0, fixedDeposits: 90000, otherAccessible: 0, monthlyOutgoings: 30000 })?.months, 3);
  assert.equal(calculateEmergencyCoverage({ cashAndBank: 30000, fixedDeposits: 60000, otherAccessible: 30000, monthlyOutgoings: 30000 })?.months, 4);
});

test('zero, negative, and non-finite inputs cannot produce a result', () => {
  assert.equal(calculateEmergencyCoverage({ cashAndBank: 1, fixedDeposits: 0, otherAccessible: 0, monthlyOutgoings: 0 }), null);
  assert.equal(calculateEmergencyCoverage({ cashAndBank: -1, fixedDeposits: 0, otherAccessible: 0, monthlyOutgoings: 1 }), null);
  assert.equal(calculateEmergencyCoverage({ cashAndBank: 1, fixedDeposits: 0, otherAccessible: Infinity, monthlyOutgoings: 1 }), null);
  assert.equal(calculateEmergencyCoverage({ cashAndBank: 1_000_000_000_000_000, fixedDeposits: 1, otherAccessible: 0, monthlyOutgoings: 1 }), null);
  assert.equal(calculateEmergencyCoverage({ cashAndBank: Number.MAX_VALUE, fixedDeposits: Number.MAX_VALUE, otherAccessible: 0, monthlyOutgoings: 1 }), null);
});

test('prefills count FD principal and budget outgoings, never retirement balances or RDs', () => {
  const holdings = [
    { product_type: 'fd_rd', characteristics: { deposit_mode: 'FD', principal_or_monthly_amount: 50000 } },
    { product_type: 'fd_rd', characteristics: { deposit_mode: 'RD', principal_or_monthly_amount: 5000 } },
    { product_type: 'ppf_epf', characteristics: { current_balance: 900000 } },
  ];
  assert.equal(emergencyFixedDepositPrefill(holdings), 50000);
  assert.equal(emergencyBudgetPrefill({ recurring_outflows_total: 20000, discretionary_total: 10000 }), 30000);
});

test('missing records coherently prefill as zero without changing manual calculation', () => {
  assert.equal(emergencyFixedDepositPrefill([]), 0);
  assert.equal(calculateEmergencyCoverage({ cashAndBank: 40000, fixedDeposits: 0, otherAccessible: 0, monthlyOutgoings: 20000 })?.months, 2);
});

test('zero accessible balance is a measured zero-month result', () => {
  assert.deepEqual(calculateEmergencyCoverage({ cashAndBank: 0, fixedDeposits: 0, otherAccessible: 0, monthlyOutgoings: 20000 }), { accessibleBalances: 0, months: 0 });
});

test('missing deposit mode defaults to FD while junk and malformed amounts do not count', () => {
  const holdings = [
    { product_type: 'fd_rd', characteristics: { principal_or_monthly_amount: 25000 } },
    { product_type: 'fd_rd', characteristics: { deposit_mode: 'FD', principal_or_monthly_amount: 'junk' } },
    { product_type: 'ppf_epf', characteristics: { current_balance: '999999' } },
  ];
  assert.equal(emergencyFixedDepositPrefill(holdings), 25000);
});

test('identical inputs have one stable committed signature on either surface', () => {
  const inputs = { cashAndBank: 10000, fixedDeposits: 20000, otherAccessible: 0, monthlyOutgoings: 10000 };
  assert.equal(emergencyCoverageSignature(inputs), emergencyCoverageSignature({ ...inputs }));
  assert.equal(calculateEmergencyCoverage(inputs)?.months, 3); // shared S-05/C-14 result
});

test('a delayed prefill applies only before the field is edited', () => {
  assert.equal(emergencyPrefillWhenUntouched(false, 45000), 45000);
  assert.equal(emergencyPrefillWhenUntouched(true, 45000), null);
});

test('scenario and calculator each emit once for the same result, not once per render', () => {
  const signature = emergencyCoverageSignature({ cashAndBank: 10000, fixedDeposits: 0, otherAccessible: 0, monthlyOutgoings: 5000 });
  let scenarioLast = null;
  let calculatorLast = null;
  assert.equal(shouldEmitEmergencyCoverage(scenarioLast, signature), true);
  scenarioLast = signature;
  assert.equal(shouldEmitEmergencyCoverage(scenarioLast, signature), false);
  assert.equal(shouldEmitEmergencyCoverage(calculatorLast, signature), true);
  calculatorLast = signature;
  assert.equal(shouldEmitEmergencyCoverage(calculatorLast, signature), false);
});
