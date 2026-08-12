// @ts-nocheck -- executed directly by Node 26's built-in TS-strip + test runner;
// the Expo program intentionally does not install Node type declarations.
import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCompoundGrowth } from './compoundGrowth.ts';

const result = (...args) => { const outcome = calculateCompoundGrowth(...args); assert.equal(outcome.ok, true); return outcome.result; };
const error = (...args) => { const outcome = calculateCompoundGrowth(...args); assert.equal(outcome.ok, false); return outcome.error; };
test('zero rate is contributions only', () => assert.deepEqual(result(1000, 100, 0, 1), { endingAmount: 2200, totalContributed: 2200, arithmeticDifference: 0, months: 12 }));
test('month-end contribution does not compound in its contribution month', () => assert.ok(Math.abs(result(0, 100, 12, 1 / 12).endingAmount - 100) < 1e-9));
test('lump sum compounds for the full monthly period', () => assert.equal(result(100, 0, 12, 1 / 12).endingAmount, 101));
test('fractional years use rounded month count', () => assert.equal(result(100, 0, 0, 0.125).months, 2));
test('typed validation distinguishes negative amounts and rates', () => { assert.equal(error(100, -1, 10, 5), 'negative_value'); assert.equal(error(100, 0, -1, 5), 'negative_value'); });
test('typed validation distinguishes zero and tiny horizons', () => { assert.equal(error(100, 0, 10, 0), 'horizon_rounds_to_zero'); assert.equal(error(100, 0, 10, 0.01), 'horizon_rounds_to_zero'); });
test('typed validation distinguishes combination overflow', () => assert.equal(error(1_000_000_000_000, 1_000_000_000_000, 1000, 200), 'numeric_overflow'));
test('rejects other invalid and unsafe inputs accurately', () => { assert.equal(error(0, 0, 10, 5), 'amount_required'); assert.equal(error(100, 0, Number.NaN, 5), 'non_finite'); assert.equal(error(1_000_000_000_001, 0, 10, 5), 'amount_too_large'); assert.equal(error(100, 0, 1001, 5), 'rate_out_of_range'); assert.equal(error(100, 0, 10, 201), 'horizon_out_of_range'); });
