// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import { reminderScheduleFor, REMINDER_HOUR } from './reminderSchedule.ts';

const loan = (emi_due_day) => ({ id: 'h1', product_type: 'home_loan', characteristics: { emi_due_day } });
const card = (payment_due_date) => ({ id: 'h2', product_type: 'credit_card_debt', characteristics: { payment_due_date } });

test('an EMI due day becomes a recurring monthly day', () => {
  assert.deepEqual(reminderScheduleFor(loan(5)), {
    day: 5,
    body: 'An EMI date you recorded is coming up.',
    clamped: false,
  });
  assert.equal(REMINDER_HOUR, 9);
});

test("a card's payment due date recurs on that date's day of the month", () => {
  const schedule = reminderScheduleFor(card('2026-08-14'));
  assert.equal(schedule.day, 14);
  assert.equal(schedule.body, 'A payment date you recorded is coming up.');
  assert.equal(schedule.clamped, false);
});

test('a past due date still schedules — the obligation recurs, it does not expire', () => {
  // The previous one-shot implementation returned null here, so a card whose recorded date
  // had passed reminded the user never again.
  assert.equal(reminderScheduleFor(card('2020-01-09')).day, 9);
});

test('a due day past the 28th is pulled back so no month is skipped', () => {
  for (const day of [29, 30, 31]) {
    assert.deepEqual(reminderScheduleFor(loan(day)).day, 28, `day ${day} should clamp`);
    assert.equal(reminderScheduleFor(loan(day)).clamped, true);
  }
  assert.equal(reminderScheduleFor(loan(28)).clamped, false);
});

test('out-of-range, missing, and malformed values schedule nothing', () => {
  assert.equal(reminderScheduleFor(loan(0)), null);
  assert.equal(reminderScheduleFor(loan(32)), null);
  assert.equal(reminderScheduleFor(loan(NaN)), null);
  assert.equal(reminderScheduleFor(loan('5')), null);
  assert.equal(reminderScheduleFor({ id: 'h', product_type: 'home_loan', characteristics: {} }), null);
  assert.equal(reminderScheduleFor(card('not-a-date')), null);
  assert.equal(reminderScheduleFor(card(20260814)), null);
});

test('a fractional due day floors rather than rounding up past the due date', () => {
  assert.equal(reminderScheduleFor(loan(5.9)).day, 5);
});

test('product types without a recorded due cycle are never scheduled', () => {
  for (const product_type of ['equity_mutual_fund', 'term_insurance', 'ppf_epf', 'esop']) {
    assert.equal(reminderScheduleFor({ id: 'h', product_type, characteristics: { emi_due_day: 5 } }), null);
  }
});
