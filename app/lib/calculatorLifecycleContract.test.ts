// @ts-nocheck
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const calculatorSource = readFileSync(new URL('../screens/CalculatorScreen.tsx', import.meta.url), 'utf8');
const emergencySource = readFileSync(new URL('../components/EmergencyCoverageTool.tsx', import.meta.url), 'utf8');

test('all calculator result cards expose the frozen evidence headings', () => {
  for (const heading of ['Inputs used', 'Formula and convention', 'Rounding, caps and omissions']) {
    assert.match(calculatorSource, new RegExp(heading));
    assert.match(emergencySource, new RegExp(heading));
  }
  assert.equal((calculatorSource.match(/inputsUsed=/g) ?? []).length, 8);
  assert.equal((calculatorSource.match(/roundingAndOmissions=/g) ?? []).length, 8);
});

test('all manual calculators have reset and strict whole-string parsing', () => {
  assert.equal((calculatorSource.match(/<CalcButton /g) ?? []).length, 8);
  assert.equal((calculatorSource.match(/onReset=/g) ?? []).length, 8);
  assert.match(calculatorSource, /parseScenarioNumber/);
  assert.doesNotMatch(calculatorSource, /(?<!Scenario)Number\((balance|target|principal|present|sip|initial|lumpSum)\)/);
  assert.match(emergencySource, /Reset scenario/);
  assert.match(emergencySource, /parseScenarioNumber/);
});

test('current results invalidate with the approved neutral notice', () => {
  const notice = 'Inputs changed — run again to see a result for these values.';
  assert.match(calculatorSource, new RegExp(notice.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(emergencySource, new RegExp(notice.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('credit-card payoff is manual-only and Emergency candidates require inclusion', () => {
  const cardBlock = calculatorSource.slice(calculatorSource.indexOf('function CreditCardPayoffCalc'));
  assert.doesNotMatch(cardBlock, /fetchHoldings|selectedCard|recorded candidate/i);
  assert.match(cardBlock, /FinTutor does not select a card or payment for you/);
  assert.match(emergencySource, /NOT YET INCLUDED/);
  assert.match(emergencySource, />Include</);
  assert.match(emergencySource, /fdCandidateIncluded/);
  assert.match(emergencySource, /outgoingsCandidateIncluded/);
});
