// @ts-nocheck
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const clientSource = readFileSync(new URL('./loanVsInvest.ts', import.meta.url), 'utf8');

test('loan-vs-invest sends financial inputs in an authenticated POST body', () => {
  assert.match(clientSource, /method:\s*'POST'/);
  assert.match(clientSource, /body:\s*JSON\.stringify\(\{ holding_id: holdingId, prepay_amount: prepayAmount \}\)/);
  assert.doesNotMatch(clientSource, /URLSearchParams/);
  assert.doesNotMatch(clientSource, /loan-vs-invest\?/);
});
