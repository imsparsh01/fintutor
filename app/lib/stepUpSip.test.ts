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
  assert.equal(calculateStepUpSip(100, 10, 0, 10), null);
  assert.equal(calculateStepUpSip(100, 10, 12, 1.5), null);
});
