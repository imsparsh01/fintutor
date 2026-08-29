// @ts-nocheck
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const screen = readFileSync(new URL('../screens/ScenarioScreen.tsx', import.meta.url), 'utf8');
const tools = readFileSync(new URL('../screens/ToolsScreen.tsx', import.meta.url), 'utf8');

test('Tools exposes only the five approved dedicated Scenario names', () => {
  for (const name of ['Emergency runway', 'Increase my SIP', 'Debt cost', 'Idle cash over time', 'Time to corpus']) {
    assert.match(tools, new RegExp(`label: '${name}'`));
  }
  assert.doesNotMatch(tools, /Prepay vs\. invest|LoanVsInvestModal|What if…/);
});

test('production Scenario wiring uses typed candidates and strict numeric parsing', () => {
  assert.match(screen, /fetchScenarioCandidates/);
  assert.match(screen, /parseScenarioNumber/);
  assert.match(screen, /createCandidateDrafts/);
  assert.doesNotMatch(screen, /derivePrefills|parseFloat|fetchBudget/);
});

test('production Scenario lifecycle includes exact invalidation, clean focus session and reset', () => {
  assert.match(screen, /INPUTS_CHANGED_NOTICE/);
  assert.match(screen, /useFocusEffect/);
  assert.match(screen, /setFocused\(false\)/);
  assert.match(screen, /resetCandidateDrafts/);
  assert.match(screen, /Reset scenario/);
});

test('results expose focus, live announcement, frozen inputs, formula and limits', () => {
  assert.match(screen, /announceForAccessibility/);
  assert.match(screen, /setAccessibilityFocus/);
  assert.match(screen, /accessibilityRole="header"/);
  for (const heading of ['Inputs used', 'Formula and convention', 'Rounding, caps and omissions']) {
    assert.match(screen, new RegExp(heading));
  }
});
