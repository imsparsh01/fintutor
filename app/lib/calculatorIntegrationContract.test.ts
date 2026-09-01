// @ts-nocheck
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const calculator = readFileSync(new URL('../screens/CalculatorScreen.tsx', import.meta.url), 'utf8');
const emergency = readFileSync(new URL('../components/EmergencyCoverageTool.tsx', import.meta.url), 'utf8');
const modal = readFileSync(new URL('../components/ScenarioHandoffModal.tsx', import.meta.url), 'utf8');
const progression = readFileSync(new URL('./progression.ts', import.meta.url), 'utf8');

test('all nine Calculator types receive current-result-only bounded handoffs', () => {
  for (const type of ['sip_goal', 'emi', 'inflation', 'stepup_sip', 'cagr_backward', 'compound_growth', 'credit_card_payoff', 'goal_affordability']) {
    assert.match(calculator, new RegExp(`calculatorHandoff\\('${type}'`));
  }
  assert.match(emergency, /scenarioType: 'emergency_coverage', surface: 'calculator'/);
  assert.equal((calculator.match(/handoffPrompt=/g) ?? []).length, 8);
  assert.match(emergency, /prompt=\{result\.handoffPrompt\}/);
});

test('handoff requires exact-payload confirmation and cancel performs no navigation', () => {
  assert.match(modal, /Nothing is sent until you confirm/);
  assert.match(modal, /onPress=\{onCancel\}/);
  assert.match(modal, /event\.key === 'Escape'/);
  assert.match(modal, /removeEventListener\('keydown', dismissOnEscape\)/);
  assert.doesNotMatch(modal, /navigate|authenticatedFetch|askQuestion/);
  assert.match(calculator, /onCancel=\{cancelHandoff\}/);
  assert.match(emergency, /onCancel=\{cancelHandoff\}/);
  assert.match(calculator, /handoffOpener\.current/);
  assert.match(emergency, /handoffOpener\.current/);
});

test('Calculator progression remains stable type-only and result-render gated', () => {
  assert.match(calculator, /recordCalculatorCompleted\(userId, type\)/);
  assert.equal((calculator.match(/recordCalculatorCompleted\(/g) ?? []).length, 1);
  assert.match(progression, /`calculator:\$\{calculatorType\}:\$\{todayStamp\(\)\}`/);
  assert.match(progression, /'calculator_completed',\s*calculatorType/);
  assert.match(progression, /catch \{/);
  assert.match(progression, /body: JSON\.stringify\(\{\s*event_type: eventType,\s*subject_key: subjectKey,/);
});
