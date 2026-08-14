// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  LEARNING_REMINDER_COPY,
  LEARNING_REMINDER_HORIZON,
  nextLearningReminderOccurrences,
  validReminderTime,
} from './learningReminderSchedule.ts';

test('schedules exactly one occurrence per day at the chosen local time', () => {
  const dates = nextLearningReminderOccurrences(19, 30, new Date(2027, 0, 10, 12));
  assert.equal(dates.length, LEARNING_REMINDER_HORIZON);
  assert.deepEqual(dates.slice(0, 3).map(({ date }) => [date.getDate(), date.getHours(), date.getMinutes()]), [[10, 19, 30], [11, 19, 30], [12, 19, 30]]);
});

test('a passed time starts tomorrow and never schedules twice in one day', () => {
  const dates = nextLearningReminderOccurrences(9, 0, new Date(2027, 0, 10, 9, 1));
  assert.equal(dates[0].date.getDate(), 11);
  assert.equal(new Set(dates.map(({ date }) => date.toDateString())).size, dates.length);
});

test('copy rotates generically without financial or pressure-shaped content', () => {
  const items = nextLearningReminderOccurrences(19, 0, new Date(2027, 0, 10, 12), 6);
  assert.ok(new Set(items.map(({ body }) => body)).size > 1);
  for (const body of LEARNING_REMINDER_COPY) {
    assert.doesNotMatch(body, /₹|balance|holding|loan|insurance|fund|streak|lose|urgent|should|return|goal/i);
  }
});

test('time and count validation reject malformed schedules', () => {
  assert.equal(validReminderTime(0, 0), true);
  assert.equal(validReminderTime(23, 59), true);
  assert.equal(validReminderTime(24, 0), false);
  assert.equal(validReminderTime(9.5, 0), false);
  assert.deepEqual(nextLearningReminderOccurrences(9, 60), []);
  assert.deepEqual(nextLearningReminderOccurrences(9, 0, new Date('bad')), []);
  assert.deepEqual(nextLearningReminderOccurrences(9, 0, new Date(), 0), []);
});
