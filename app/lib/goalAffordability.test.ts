// @ts-nocheck -- run directly with Node's TypeScript stripping.
import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateGoalAffordability } from './goalAffordability.ts';

const result = (...args) => { const outcome = calculateGoalAffordability(...args); assert.equal(outcome.ok, true); return outcome.result; };
const error = (...args) => { const outcome = calculateGoalAffordability(...args); assert.equal(outcome.ok, false); return outcome.error; };

test('zero-rate model uses current amount plus month-end contributions', () => {
  assert.deepEqual(result(2_200, 1_000, 100, 0, 1), { endingValue: 2_200, requiredMonthlyContribution: 100, monthlyContributionGap: 0, months: 12 });
});
test('positive-rate model follows the approved month-end formula', () => {
  const modeled = result(10_000, 1_000, 500, 12, 1);
  const r = 0.01; const growth = (1 + r) ** 12; const factor = (growth - 1) / r;
  assert.ok(Math.abs(modeled.endingValue - (1_000 * growth + 500 * factor)) < 1e-8);
  assert.ok(Math.abs(modeled.requiredMonthlyContribution - ((10_000 - 1_000 * growth) / factor)) < 1e-8);
  assert.ok(Math.abs(modeled.monthlyContributionGap - (500 - modeled.requiredMonthlyContribution)) < 1e-8);
});
test('current amount already exceeding the modeled target makes required monthly zero', () => {
  const modeled = result(1_000, 2_000, 50, 0, 1); assert.equal(modeled.requiredMonthlyContribution, 0); assert.equal(modeled.monthlyContributionGap, 50);
});
test('negative gap means planned monthly is below the modeled requirement', () => {
  const modeled = result(1_200, 0, 50, 0, 1); assert.equal(modeled.requiredMonthlyContribution, 100); assert.equal(modeled.monthlyContributionGap, -50);
});
test('fractional years use the shared rounded-month convention', () => assert.equal(result(1_000, 0, 100, 0, 0.125).months, 2));
test('validation rejects unsafe and unsupported combinations', () => {
  assert.equal(error(0, 0, 0, 0, 1), 'target_required'); assert.equal(error(1, -1, 0, 0, 1), 'negative_value');
  assert.equal(error(1, 0, 0, Number.NaN, 1), 'non_finite'); assert.equal(error(1_000_000_000_001, 0, 0, 0, 1), 'amount_too_large');
  assert.equal(error(1, 0, 0, 1_001, 1), 'rate_out_of_range'); assert.equal(error(1, 0, 0, 0, 201), 'horizon_out_of_range');
  assert.equal(error(1, 0, 0, 0, 0.01), 'horizon_rounds_to_zero'); assert.equal(error(1_000_000_000_000, 0, 0, 1_000, 200), 'numeric_overflow');
});
