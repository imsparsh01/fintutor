// @ts-nocheck -- run directly with Node's TypeScript stripping.
import assert from 'node:assert/strict';
import test from 'node:test';

import { ApiResponseError, isStaleWriteError, readApiResponse } from './apiResponse.ts';

test('unwraps FastAPI stale-write detail into a typed 409 error', async () => {
  const current = { id: 'goal-1', version: 3 };
  const proposed = { category: 'Education' };
  const response = new Response(JSON.stringify({
    detail: { message: 'Review the refreshed record.', current, proposed },
  }), { status: 409, headers: { 'Content-Type': 'application/json' } });

  await assert.rejects(
    () => readApiResponse(response),
    (error: unknown) => {
      assert.ok(isStaleWriteError<typeof current, typeof proposed>(error));
      assert.equal(error.message, 'Review the refreshed record.');
      assert.deepEqual(error.detail.current, current);
      assert.deepEqual(error.detail.proposed, proposed);
      return true;
    },
  );
});

test('preserves non-object and non-409 failures without classifying them as stale', async () => {
  const response = new Response(JSON.stringify({ detail: 'Goal not found' }), { status: 404 });
  await assert.rejects(
    () => readApiResponse(response),
    (error: unknown) => {
      assert.ok(error instanceof ApiResponseError);
      assert.equal(error.status, 404);
      assert.equal(error.detail, 'Goal not found');
      assert.equal(isStaleWriteError(error), false);
      return true;
    },
  );
});
