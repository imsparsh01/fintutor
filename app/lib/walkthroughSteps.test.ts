// @ts-nocheck — executed directly by Node's built-in TypeScript test runner.
import assert from 'node:assert/strict';
import test from 'node:test';
import { buildWalkthroughPlan } from './walkthroughSteps.ts';

function holding(characteristics: Record<string, unknown> = {}) {
  return {
    id: '1', product_type: 'home_loan', alias: 'Home Loan-1', display_name: null,
    characteristics,
  };
}

test('uses known saved values with provenance and preserves a real zero', () => {
  const plan = buildWalkthroughPlan('loans', [holding({
    outstanding_balance: 500000, interest_rate: 0, emi_amount: 12000,
  })]);
  assert.equal(plan.steps[0].source, 'your saved loans record');
  assert.deepEqual(plan.steps[0].figures?.map((figure) => figure.value), ['₹5,00,000', '0%', '₹12,000']);
  assert.deepEqual(plan.steps[0].missing, []);
  assert.equal(plan.missingQuestion, null);
});

test('unknown and malformed values are named as missing, never fabricated or zeroed', () => {
  const plan = buildWalkthroughPlan('loans', [holding({
    outstanding_balance: 'not-a-number', interest_rate: Number.NaN,
  })]);
  assert.deepEqual(plan.steps[0].figures, []);
  assert.deepEqual(plan.steps[0].missing, ['Outstanding balance', 'Interest rate', 'EMI']);
  assert.match(plan.missingQuestion ?? '', /ask me only/i);
  assert.match(plan.missingQuestion ?? '', /Do not save anything until I confirm/);
});

test('an empty family requests one record without inventing an example', () => {
  const plan = buildWalkthroughPlan('insurance', []);
  assert.deepEqual(plan.steps[0].missing, ['One insurance record']);
  assert.match(plan.steps[0].body, /will not invent/);
  assert.match(plan.missingQuestion ?? '', /show me everything before saving/);
});
