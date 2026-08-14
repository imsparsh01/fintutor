// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  nextReminderOccurrences,
  reminderScheduleFor,
  REMINDER_HOUR,
  REMINDER_OCCURRENCE_COUNT,
} from './reminderSchedule.ts';

const loan = (emi_due_day) => ({ id: 'h1', product_type: 'home_loan', characteristics: { emi_due_day } });
const card = (payment_due_date) => ({ id: 'h2', product_type: 'credit_card_debt', characteristics: { payment_due_date } });

test('an EMI retains the selected recurring day', () => {
  assert.deepEqual(reminderScheduleFor(loan(31)), {
    selectedDay: 31,
    body: 'An EMI date you recorded is coming up.',
  });
  assert.equal(REMINDER_HOUR, 9);
});

test("a card's full date contributes its original day of month", () => {
  const schedule = reminderScheduleFor(card('2026-08-14'));
  assert.equal(schedule.selectedDay, 14);
  assert.equal(schedule.body, 'A payment date you recorded is coming up.');
});

test('a past card date still creates a recurring due-day schedule', () => {
  assert.equal(reminderScheduleFor(card('2020-01-09')).selectedDay, 9);
});

test('the 31st clamps only in short months and returns in longer months', () => {
  const schedule = reminderScheduleFor(loan(31));
  const occurrences = nextReminderOccurrences(schedule, new Date(2027, 0, 30, 12));
  assert.equal(occurrences.length, REMINDER_OCCURRENCE_COUNT);
  assert.deepEqual(
    occurrences.slice(0, 4).map(({ date, clamped }) => [date.getFullYear(), date.getMonth(), date.getDate(), clamped]),
    [
      [2027, 0, 31, false],
      [2027, 1, 28, true],
      [2027, 2, 31, false],
      [2027, 3, 30, true],
    ]
  );
});

test('leap-year February clamps the 30th to the 29th', () => {
  const occurrences = nextReminderOccurrences(reminderScheduleFor(loan(30)), new Date(2028, 0, 31));
  assert.equal(occurrences[0].date.getMonth(), 1);
  assert.equal(occurrences[0].date.getDate(), 29);
  assert.equal(occurrences[0].clamped, true);
});

test('a passed occurrence starts with the next month', () => {
  const occurrences = nextReminderOccurrences(reminderScheduleFor(loan(5)), new Date(2027, 4, 5, 10));
  assert.equal(occurrences[0].date.getMonth(), 5);
  assert.equal(occurrences[0].date.getDate(), 5);
});

test('out-of-range, missing, and malformed values schedule nothing', () => {
  assert.equal(reminderScheduleFor(loan(0)), null);
  assert.equal(reminderScheduleFor(loan(32)), null);
  assert.equal(reminderScheduleFor(loan(NaN)), null);
  assert.equal(reminderScheduleFor(loan('5')), null);
  assert.equal(reminderScheduleFor({ id: 'h', product_type: 'home_loan', characteristics: {} }), null);
  assert.equal(reminderScheduleFor(card('not-a-date')), null);
  assert.equal(reminderScheduleFor(card('2026-02-31')), null);
  assert.equal(reminderScheduleFor(card(20260814)), null);
});

test('a fractional due day floors rather than rounding past the due date', () => {
  assert.equal(reminderScheduleFor(loan(5.9)).selectedDay, 5);
});

test('product types without a recorded due cycle are never scheduled', () => {
  for (const product_type of ['equity_mutual_fund', 'term_insurance', 'ppf_epf', 'esop']) {
    assert.equal(reminderScheduleFor({ id: 'h', product_type, characteristics: { emi_due_day: 5 } }), null);
  }
});
