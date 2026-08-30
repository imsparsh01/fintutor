// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import { buildScenarioHandoffPrompt } from './scenarioHandoff.ts';

test('builds a bounded mechanism-only prompt from stable type and normalized inputs', () => {
  const prompt = buildScenarioHandoffPrompt({
    scenarioType: 'idle_cash',
    normalizedInputs: { amount: 500000, path_a_rate_percent: 4, path_b_rate_percent: 10, years: 5 },
    formulaBoundary: 'Compound the same amount annually under both user-entered rates.',
    omissions: 'Taxes, fees, liquidity, risk and rate variability.',
  });
  assert.match(prompt!, /Scenario type: idle_cash/);
  assert.match(prompt!, /amount=500000/);
  assert.match(prompt!, /without recommending an action/);
  assert.match(prompt!, /Do not choose, rank, or recommend/);
});

test('rejects unsafe type/field shapes and non-finite values', () => {
  const base = { scenarioType: 'idle_cash', normalizedInputs: { amount: 1 }, formulaBoundary: 'Bounded.', omissions: 'None.' };
  assert.equal(buildScenarioHandoffPrompt({ ...base, scenarioType: 'record:123' }), null);
  assert.equal(buildScenarioHandoffPrompt({ ...base, normalizedInputs: { source_record_id: 123 } }), null);
  assert.equal(buildScenarioHandoffPrompt({ ...base, normalizedInputs: { product_name: 'Real Fund' } }), null);
  assert.equal(buildScenarioHandoffPrompt({ ...base, normalizedInputs: {} }), null);
});
