// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ASSESSMENT_QUESTIONS,
  ASSESSMENT_QUESTION_ORDER,
  EXCLUSIVE_EXPOSURE_VALUES,
  assessmentValueLabels,
} from './assessmentVocabulary.ts';

test('management uses the same five normalized axes as onboarding', () => {
  assert.deepEqual(Object.keys(ASSESSMENT_QUESTIONS), [...ASSESSMENT_QUESTION_ORDER]);
});

test('stored normalized codes render as approved user-facing labels', () => {
  assert.deepEqual(assessmentValueLabels('earning_context', 'early_earner'), ['Started earning recently']);
  assert.deepEqual(
    assessmentValueLabels('exposure_flags', ['saving', 'workplace_and_tax']),
    ['Saving', 'Workplace benefits or tax'],
  );
  assert.deepEqual(assessmentValueLabels('familiarity', null), []);
});

test('multi-select exclusive answers match onboarding behavior', () => {
  assert.deepEqual([...EXCLUSIVE_EXPOSURE_VALUES].sort(), ['none', 'undisclosed', 'unsure']);
});
