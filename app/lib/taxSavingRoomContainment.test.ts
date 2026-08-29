// @ts-nocheck
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const budgeting = readFileSync(new URL('../screens/BudgetingScreen.tsx', import.meta.url), 'utf8');

test('ordinary Budget UI has no 80C launcher or modal wiring', () => {
  assert.equal(budgeting.includes('TaxSavingRoomModal'), false);
  assert.equal(budgeting.includes('Check my 80C room'), false);
  assert.equal(budgeting.includes('checkingTaxSaving'), false);
});

test('the parked client remains outside ordinary Budget production reachability', () => {
  assert.equal(budgeting.includes("../lib/taxSavingRoom"), false);
  assert.equal(budgeting.includes('fetchTaxSavingRoom'), false);
});
