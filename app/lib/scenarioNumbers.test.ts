// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import { finiteMoneyOutput, parseScenarioNumber } from './scenarioNumbers.ts';

test('accepts complete plain, Indian-grouped and international-grouped numbers', () => {
  assert.deepEqual(parseScenarioNumber(' 12500.50 '), { value: 12500.5, normalized: '12500.5' });
  assert.deepEqual(parseScenarioNumber('1,23,45,678.90'), { value: 12345678.9, normalized: '12345678.9' });
  assert.deepEqual(parseScenarioNumber('123,456,789.25'), { value: 123456789.25, normalized: '123456789.25' });
  assert.deepEqual(parseScenarioNumber('+1,234'), { value: 1234, normalized: '1234' });
  assert.deepEqual(parseScenarioNumber('-0'), { value: 0, normalized: '0' });
});

test('rejects ambiguous, mixed, partial, exponential and non-finite grammar', () => {
  for (const value of ['', ' ', '.5', '5.', '1,23', '12,345,67', '1,234,56,789', '1 000',
    '₹1000', '1e3', '1E3', 'NaN', 'Infinity', '--1', '1.2.3', '100junk']) {
    assert.equal(parseScenarioNumber(value), null, value);
  }
});

test('money-output guard accepts the ceiling and rejects unsafe magnitudes', () => {
  assert.equal(finiteMoneyOutput(0, 1_000_000_000_000_000), true);
  assert.equal(finiteMoneyOutput(1_000_000_000_000_001), false);
  assert.equal(finiteMoneyOutput(Infinity), false);
  assert.equal(finiteMoneyOutput(Number.NaN), false);
});
