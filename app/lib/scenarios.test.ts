// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import { debtCost, derivePrefills, idleCashOpportunity, monthsToTarget, sipIncrease } from './scenarios.ts';

const close = (actual, expected, epsilon = 0.01) => assert.ok(Math.abs(actual - expected) <= epsilon, `${actual} != ${expected}`);

test('S-03 matches exact normal and zero-rate fixtures', () => {
  const normal = sipIncrease(10000, 2000, 12, 10);
  close(normal.base, 2300386.8946); close(normal.raised, 2760464.2735);
  close(normal.difference, 460077.3789); assert.equal(normal.extraInvested, 240000);
  const zero = sipIncrease(10000, 2000, 0, 10);
  assert.deepEqual(zero, { base: 1200000, raised: 1440000, difference: 240000, extraInvested: 240000 });
});

test('S-03 enforces every exact input edge and rejects unsafe output', () => {
  assert.ok(sipIncrease(0, 1, 0, 1 / 12));
  assert.ok(sipIncrease(1_000_000_000, 1_000_000_000, 0, 60));
  for (const args of [[-1,1,0,1],[1_000_000_001,1,0,1],[0,0,0,1],[0,1_000_000_001,0,1],
    [0,1,-1,1],[0,1,100.0001,1],[0,1,0,0.01],[0,1,0,60.01],[Infinity,1,0,1],[0,1,NaN,1],
    [1_000_000_000,1_000_000_000,100,60]]) assert.equal(sipIncrease(...args), null);
});

test('S-06 matches exact amortisation fixtures including zero rate', () => {
  const normal = debtCost(1_000_000, 12, 120);
  close(normal.emi, 14347.09484); close(normal.totalPayable, 1721651.3808);
  close(normal.totalInterest, 721651.3808); close(normal.nextYearInterest, 117033.09467);
  assert.deepEqual(debtCost(1_000_000, 0, 1), { emi: 1_000_000, totalPayable: 1_000_000, totalInterest: 0, nextYearInterest: 0 });
});

test('S-06 accepts exact limits and rejects fractional/type/domain/overflow cases', () => {
  assert.ok(debtCost(1, 0, 1)); assert.ok(debtCost(1_000_000_000_000, 0, 600));
  assert.ok(debtCost(1_000_000_000_000, 100, 600));
  for (const args of [[0,1,1],[1_000_000_000_001,1,1],[1,-1,1],[1,100.01,1],[1,1,0],
    [1,1,601],[1,1,1.5],[Infinity,1,1],[1,NaN,1]]) {
    assert.equal(debtCost(...args), null);
  }
  const prefills = derivePrefills(null, [{ id:'c', alias:'Card', display_name:null, product_type:'credit_card_debt', characteristics:{outstanding_balance:1000,interest_rate:20,tenure_months:12} }]);
  assert.deepEqual(prefills.loans, []);
});

test('S-07 preserves equality and signed negative arithmetic', () => {
  const normal = idleCashOpportunity(500000, 4, 10, 5);
  close(normal.atSavingsRate, 608326.4512); close(normal.atAlternateRate, 805255);
  close(normal.difference, 196928.5488);
  assert.equal(idleCashOpportunity(500000, 4, 4, 5).difference, 0);
  assert.ok(idleCashOpportunity(500000, 10, 4, 5).difference < 0);
});

test('S-07 accepts exact limits and rejects just-outside or unsafe outputs', () => {
  assert.ok(idleCashOpportunity(1, 0, 0, Number.MIN_VALUE));
  for (const args of [[0,0,0,1],[1_000_000_000_001,0,0,1],[1,-1,0,1],[1,0,100.1,1],
    [1,0,0,0],[1,0,0,60.01],[Infinity,0,0,1],[1_000_000_000_000,100,100,60]]) {
    assert.equal(idleCashOpportunity(...args), null);
  }
});

test('S-01 reaches the exact target fixture and preserves zero/cap outcomes', () => {
  assert.equal(monthsToTarget(500000, 10000, 12, 2000000).months, 70);
  assert.deepEqual(monthsToTarget(500000, 0, 0, 400000), { months: 0, years: 0, alreadyReached: true });
  assert.deepEqual(monthsToTarget(0, 0, 0, 1), { months: null, years: null, alreadyReached: false });
  assert.deepEqual(monthsToTarget(0, 0, 1, 1), { months: null, years: null, alreadyReached: false });
});

test('S-01 accepts exact input limits and rejects unsafe balance before false reach', () => {
  assert.ok(monthsToTarget(0, 0, 0, 1));
  assert.ok(monthsToTarget(1_000_000_000_000, 1_000_000_000_000, 0, 1));
  for (const args of [[-1,0,0,1],[1_000_000_000_001,0,0,1],[0,-1,0,1],[0,1_000_000_000_001,0,1],
    [0,0,-1,1],[0,0,100.1,1],[0,0,0,0],[0,0,0,1_000_000_000_000_001],[Infinity,0,0,1],
    [1_000_000_000_000,1_000_000_000_000,100,1_000_000_000_000_000]]) {
    assert.equal(monthsToTarget(...args), null);
  }
});
