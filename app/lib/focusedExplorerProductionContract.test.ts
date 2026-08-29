// @ts-nocheck
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const loan = readFileSync(new URL('../components/LoanVsInvestModal.tsx', import.meta.url), 'utf8');
const esop = readFileSync(new URL('../components/EsopExerciseCostModal.tsx', import.meta.url), 'utf8');
const term = readFileSync(new URL('../components/TermInsuranceExplorerModal.tsx', import.meta.url), 'utf8');
const tools = readFileSync(new URL('../screens/ToolsScreen.tsx', import.meta.url), 'utf8');
const budgeting = readFileSync(new URL('../screens/BudgetingScreen.tsx', import.meta.url), 'utf8');

test('loan explorer removes stale results, supports retry/reset and exposes authoritative provenance', () => {
  assert.match(loan, /INPUTS_CHANGED_NOTICE/);
  assert.match(loan, /Retry calculation/);
  assert.match(loan, /Reset explorer/);
  assert.match(loan, /source_evidence\.source_version/);
  assert.match(loan, /freshness_note/);
});

test('ESOP explorer has generation-safe retry, current-result focus and source evidence', () => {
  assert.match(esop, /generation\.current/);
  assert.match(esop, /Retry recorded grant/);
  assert.match(esop, /accessibilityRole="header"/);
  assert.match(esop, /source_evidence\.source_version/);
  assert.match(esop, /calculation_timezone/);
});

test('TERM requires explicit growth modes, starts covers excluded and removes stale results', () => {
  assert.match(term, /type GrowthMode = 'zero' \| 'custom' \| null/);
  assert.match(term, /Household-support growth mode/);
  assert.match(term, /Use 0% growth/);
  assert.match(term, /includeIndividualCover, setIncludeIndividualCover\] = useState\(false\)/);
  assert.match(term, /INPUTS_CHANGED_NOTICE/);
  assert.match(term, /accessibilityRole="header"/);
  assert.match(term, /Reset explorer/);
});

test('80C remains unavailable from production Tools and Budget surfaces', () => {
  assert.doesNotMatch(tools, /taxSavingRoom|TaxSavingRoom|80C room/);
  assert.doesNotMatch(budgeting, /taxSavingRoom|TaxSavingRoom|80C room/);
});
