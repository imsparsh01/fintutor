// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateStepUpSip } from './stepUpSip.ts';

test('month-end contribution does not compound in its contribution month', () => {
  const result = calculateStepUpSip(100, 0, 12, 1);
  const monthlyRate = 0.01;
  const expected = 100 * (((1 + monthlyRate) ** 12 - 1) / monthlyRate);
  assert.ok(result);
  assert.ok(Math.abs(result.corpus - expected) < 1e-9);
  assert.equal(result.invested, 1200);
});

test('annual step-up starts with the first contribution of the next 12-month block', () => {
  const result = calculateStepUpSip(100, 10, 12, 2);
  assert.ok(result);
  assert.equal(result.invested, 2520);
});

test('invalid inputs do not produce a modeled result', () => {
  assert.equal(calculateStepUpSip(0, 10, 12, 10), null);
  assert.equal(calculateStepUpSip(100, -1, 12, 10), null);
  assert.equal(calculateStepUpSip(100, 10, 12, 1.5), null);
});

test('zero rates are explicit valid inputs and exact ceilings are enforced', () => {
  assert.deepEqual(calculateStepUpSip(1000, 0, 0, 1), { corpus: 12000, invested: 12000 });
  assert.ok(calculateStepUpSip(1, 0, 0, 200));
  assert.equal(calculateStepUpSip(1, 0, 0, 201), null);
  assert.equal(calculateStepUpSip(1, 1001, 0, 1), null);
  assert.equal(calculateStepUpSip(1, 0, 1001, 1), null);
  assert.equal(calculateStepUpSip(1_000_000_000_001, 0, 0, 1), null);
});
