// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  AccountRequestGeneration,
  baselineLoadSummary,
  baselineStaleConflictFrom,
  beginBaselineMutation,
  holdingReminderOutcome,
  recategorisationFieldLoss,
  reconfirmStaleMutation,
  settleBaselineMutation,
} from './baselineUiState.ts';
import { CHARACTERISTICS_SCHEMA } from './characteristicsSchema.ts';

test('stale lifecycle state preserves refreshed current and proposal for explicit reconfirmation', () => {
  const proposed = { label: 'Meals', planned_amount: 4500 };
  const payload = { detail: { current: { id: 'category-1', version: 3, label: 'Food' }, proposed } };
  assert.deepEqual(baselineStaleConflictFrom(payload), payload.detail);

  const saving = beginBaselineMutation(proposed);
  assert.equal(saving.status, 'saving');
  const stale = settleBaselineMutation(proposed, { ok: false, error: payload });
  assert.equal(stale.status, 'stale');
  assert.deepEqual(reconfirmStaleMutation(stale), { ...proposed, expected_version: 3 });
});

test('non-conflict failures remain retryable failures and cannot be reconfirmed as stale', () => {
  assert.equal(baselineStaleConflictFrom({ detail: 'offline' }), null);
  const state = settleBaselineMutation({ label: 'Meals' }, {
    ok: false,
    error: new Error('offline'),
    message: 'Check your connection and try again.',
  });
  assert.deepEqual(state, {
    status: 'failed',
    proposed: { label: 'Meals' },
    message: 'Check your connection and try again.',
  });
  assert.equal(reconfirmStaleMutation(state), null);
});

test('recategorisation reports only populated fields absent from the destination schema', () => {
  const removed = recategorisationFieldLoss({
    invested_amount: 100000,
    current_value: 115000,
    risk_bucket: '',
    principal: null,
  }, CHARACTERISTICS_SCHEMA.home_loan);
  assert.deepEqual(removed, [
    { key: 'invested_amount', label: 'Invested amount', value: 100000 },
    { key: 'current_value', label: 'Current value', value: 115000 },
  ]);
});

test('an empty destination schema warns about every populated characteristic', () => {
  assert.deepEqual(recategorisationFieldLoss({ current_value: 0, note: 'Known' }, []), [
    { key: 'current_value', label: 'Current value', value: 0 },
    { key: 'note', label: 'Note', value: 'Known' },
  ]);
});

test('holding save stays authoritative when reminder scheduling fails', () => {
  const holding = { id: 'holding-1', product_type: 'home_loan' };
  assert.deepEqual(holdingReminderOutcome({
    save: { ok: true, holding },
    reminder: { failed: 'Notification permission is off.' },
  }), {
    status: 'saved_reminder_failed',
    holding,
    reminderMessage: 'Notification permission is off.',
    canRetryReminder: true,
  });
  assert.deepEqual(holdingReminderOutcome({ save: { ok: false, message: 'Save failed.' } }), {
    status: 'save_failed', message: 'Save failed.',
  });
});

test('independent section outcomes distinguish partial data from total failure', () => {
  assert.deepEqual(baselineLoadSummary({
    income: { status: 'available', data: [] },
    goals: { status: 'failed', message: 'Unavailable' },
    holdings: { status: 'available', data: [] },
  }), { status: 'partial', available: ['income', 'holdings'], failed: ['goals'] });
  assert.equal(baselineLoadSummary({
    income: { status: 'failed', message: 'Unavailable' },
    goals: { status: 'failed', message: 'Unavailable' },
  }).status, 'failed');
});

test('loading remains explicit even when other baseline sections have settled', () => {
  assert.deepEqual(baselineLoadSummary({
    income: { status: 'available', data: [] },
    goals: { status: 'loading' },
  }), { status: 'loading', available: ['income'], failed: [] });
});

test('account switch invalidates old responses even if their request completes later', () => {
  const guard = new AccountRequestGeneration();
  const accountA = guard.begin('account-a');
  guard.switchAccount('account-b');
  const accountB = guard.begin('account-b');
  assert.equal(guard.isCurrent(accountA), false);
  assert.equal(guard.isCurrent(accountB), true);
});
