// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCagr, calculateHomeLoanEmi, calculateInflationImpact, calculateSipGoal } from './calculatorEngines.ts';

test('SIP goal uses month-end inverse annuity and exact zero branch', () => {
  assert.equal(calculateSipGoal(120000, 0, 1).result.monthlyContribution, 10000);
  assert.ok(Math.abs(calculateSipGoal(5000000, 12, 10).result.monthlyContribution - 21735.47) < 0.01);
  assert.equal(calculateSipGoal(1, 0, 1 / 24).result.months, 1);
  assert.equal(calculateSipGoal(1, 0, 200).ok, true);
  assert.equal(calculateSipGoal(1, 0, 200.1).ok, false);
  assert.equal(calculateSipGoal(1_000_000_000_001, 0, 1).ok, false);
});

test('home-loan EMI supports zero and positive rates with 600-month cap', () => {
  assert.equal(calculateHomeLoanEmi(120000, 0, 1).result.emi, 10000);
  assert.ok(Math.abs(calculateHomeLoanEmi(1000000, 12, 10).result.emi - 14347.09) < 0.01);
  assert.equal(calculateHomeLoanEmi(1, 0, 50).ok, true);
  assert.equal(calculateHomeLoanEmi(1, 0, 50.1).ok, false);
});

test('inflation supports zero, fractional horizon and -100% boundary', () => {
  assert.equal(calculateInflationImpact(50000, 0, 10).result.futureCost, 50000);
  assert.equal(calculateInflationImpact(50000, -100, 1).result.futureCost, 0);
  assert.ok(Math.abs(calculateInflationImpact(100, 21, 0.5).result.futureCost - 110) < 1e-10);
  assert.equal(calculateInflationImpact(1, -100.01, 1).ok, false);
});

test('CAGR preserves gain, equality, loss and fractional years', () => {
  assert.ok(Math.abs(calculateCagr(100000, 185000, 5).result.annualRatePercent - 13.09264) < 0.001);
  assert.equal(calculateCagr(100, 100, 2).result.annualRatePercent, 0);
  assert.ok(calculateCagr(100, 50, 2).result.annualRatePercent < 0);
  assert.ok(Math.abs(calculateCagr(100, 121, 0.5).result.annualRatePercent - 46.41) < 1e-10);
  assert.equal(calculateCagr(0, 100, 1).ok, false);
});
