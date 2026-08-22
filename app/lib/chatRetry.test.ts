// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CHAT_FAILURE_MESSAGE,
  captureFailedChatRequest,
  retryInvocationFor,
} from './chatRetry.ts';

test('failed request retains only the explicit resend inputs', () => {
  assert.deepEqual(
    captureFailedChatRequest('Why is my balance moving slowly?', 'Loan-A', 'borrowing'),
    {
      question: 'Why is my balance moving slowly?',
      deepenAlias: 'Loan-A',
      onboardingTrackHint: 'borrowing',
    },
  );
});

test('retry reuses the failed request without appending a duplicate user message', () => {
  const failed = captureFailedChatRequest('What does this interest rate do?', 'Card-A');
  assert.deepEqual(retryInvocationFor(failed), {
    question: 'What does this interest rate do?',
    deepenAlias: 'Card-A',
    onboardingTrackHint: undefined,
    appendUserMessage: false,
  });
});

test('no failed request means no retry and public failure copy exposes no provider detail', () => {
  assert.equal(retryInvocationFor(null), null);
  assert.equal(CHAT_FAILURE_MESSAGE.includes('provider'), false);
  assert.match(CHAT_FAILURE_MESSAGE, /not resent/i);
});
