// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import { RequestGeneration } from './requestGeneration.ts';

test('a modal dismissal invalidates an in-flight context request', () => {
  const guard = new RequestGeneration();
  const request = guard.begin();
  guard.cancel();
  assert.equal(guard.isCurrent(request), false);
});

test('a later request supersedes an earlier request', () => {
  const guard = new RequestGeneration();
  const earlier = guard.begin();
  const later = guard.begin();
  assert.equal(guard.isCurrent(earlier), false);
  assert.equal(guard.isCurrent(later), true);
});
