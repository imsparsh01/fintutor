// @ts-nocheck
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const scenario = readFileSync(new URL('../screens/ScenarioScreen.tsx', import.meta.url), 'utf8');
const loan = readFileSync(new URL('../components/LoanVsInvestModal.tsx', import.meta.url), 'utf8');
const esop = readFileSync(new URL('../components/EsopExerciseCostModal.tsx', import.meta.url), 'utf8');
const term = readFileSync(new URL('../components/TermInsuranceExplorerModal.tsx', import.meta.url), 'utf8');
const modal = readFileSync(new URL('../components/ScenarioHandoffModal.tsx', import.meta.url), 'utf8');
const progression = readFileSync(new URL('./progression.ts', import.meta.url), 'utf8');

test('every eligible production scenario type has a bounded current-result handoff payload', () => {
  for (const type of ['emergency_runway', 'sip_increase', 'debt_cost', 'idle_cash', 'corpus_target']) {
    assert.match(scenario, new RegExp(`handoffPrompt\\('${type}'`));
  }
  assert.match(loan, /scenarioType: 'loan_vs_invest'/);
  assert.match(esop, /scenarioType: 'esop_exercise_cost'/);
  assert.match(term, /scenarioType: 'term_household_support'/);
  assert.doesNotMatch(scenario + loan + esop + term, /scenarioType: 'tax|scenarioType: '80c/);
});

test('handoff is an explicit exact-payload confirmation with a zero-send cancel path', () => {
  assert.match(modal, /Send this exact payload to Arya\?/);
  assert.match(modal, /Nothing is sent until you confirm/);
  assert.match(modal, /onPress=\{onConfirm\}/);
  assert.match(modal, /onPress=\{onCancel\}/);
  assert.doesNotMatch(modal, /askQuestion|authenticatedFetch|navigate/);
});

test('focused results emit stable type-only progression keys and failures remain swallowed', () => {
  assert.match(loan, /recordScenarioCompleted\(userId, 'loan_vs_invest'\)/);
  assert.match(esop, /recordScenarioCompleted\(userId, 'esop_exercise_cost'\)/);
  assert.match(term, /recordScenarioCompleted\(userId, 'term_household_support'\)/);
  assert.match(progression, /`scenario:\$\{scenarioType\}:\$\{todayStamp\(\)\}`/);
  assert.match(progression, /catch \{/);
});
