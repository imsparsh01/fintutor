// @ts-nocheck -- run by Node 26's built-in TS-strip test runner; Expo intentionally lacks Node types.
import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCreditCardPayoff, PAYOFF_MONTH_CAP } from './creditCardPayoff.ts';

test('ordinary payoff applies monthly interest then payment', () => {
  const result = calculateCreditCardPayoff(1000, 12, 600);
  assert.equal(result.kind, 'paid_off');
  assert.equal(result.months, 2);
  assert.ok(Math.abs(result.totalInterest - 14.1) < 1e-9);
  assert.ok(Math.abs(result.finalPayment - 414.1) < 1e-9);
});
test('zero rate uses exact partial final payment', () => assert.deepEqual(calculateCreditCardPayoff(1000, 0, 300), { kind: 'paid_off', months: 4, totalPaid: 1000, totalInterest: 0, finalPayment: 100 }));
test('exact payment closes in one month', () => assert.deepEqual(calculateCreditCardPayoff(1000, 12, 1010), { kind: 'paid_off', months: 1, totalPaid: 1010, totalInterest: 10, finalPayment: 1010 }));
test('first month interest at least payment does not clear', () => assert.equal(calculateCreditCardPayoff(1000, 12, 10).kind, 'non_clearing'));
test('1200 month cap reports no result beyond bound', () => { const result = calculateCreditCardPayoff(1000, 0, 0.5); assert.equal(result.kind, 'capped'); assert.equal(PAYOFF_MONTH_CAP, 1200); });
test('rejects finite and unsafe input failures', () => {
  assert.deepEqual(calculateCreditCardPayoff(NaN, 10, 100), { kind: 'invalid', reason: 'non_finite' });
  assert.deepEqual(calculateCreditCardPayoff(0, 10, 100), { kind: 'invalid', reason: 'balance' });
  assert.deepEqual(calculateCreditCardPayoff(100, -1, 100), { kind: 'invalid', reason: 'rate' });
  assert.deepEqual(calculateCreditCardPayoff(100, 10, 0), { kind: 'invalid', reason: 'payment' });
  assert.deepEqual(calculateCreditCardPayoff(1_000_000_000_001, 10, 100), { kind: 'invalid', reason: 'unsafe' });
});
