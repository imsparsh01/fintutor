// @ts-nocheck
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const matrix = readFileSync(
  new URL('../../docs/features/scenarios/ACCEPTANCE_MATRIX.md', import.meta.url),
  'utf8',
);
const evidence = readFileSync(
  new URL('../../docs/features/scenarios/PRODUCTION_QA_EVIDENCE.md', import.meta.url),
  'utf8',
);

test('production evidence preserves the exhaustive 96-criterion and 50-state gate', () => {
  const acceptanceIds = new Set(
    [...matrix.matchAll(/^\| (AC-[A-Z0-9-]+) \|/gm)].map((match) => match[1]),
  );
  const canonicalStates = new Set(
    [...matrix.matchAll(/^\| (SC-\d{2})[^|]*\|/gm)].map((match) => match[1]),
  );
  assert.equal(acceptanceIds.size, 96);
  assert.equal(canonicalStates.size, 50);
  assert.match(evidence, /96 unique acceptance IDs/);
  assert.match(evidence, /50 unique canonical states/);
  assert.match(evidence, /SC-01\.\.SC-50/);
});

test('production evidence does not substitute controlled-prototype evidence', () => {
  assert.match(evidence, /production `app\/` and `backend\/` implementation/);
  assert.match(evidence, /prototype and its BQ-133 evidence were not used as production evidence/);
  assert.doesNotMatch(evidence, /prototype route\/state \+ automated audit/);
});
