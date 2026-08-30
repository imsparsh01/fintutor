// @ts-nocheck
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const matrix = readFileSync(new URL('../../docs/features/calculators/ACCEPTANCE_MATRIX.md', import.meta.url), 'utf8');
const states = readFileSync(new URL('../../docs/features/calculators/JOURNEY_AND_STATES.md', import.meta.url), 'utf8');
const evidence = readFileSync(new URL('../../docs/features/calculators/PRODUCTION_QA_EVIDENCE.md', import.meta.url), 'utf8');

test('production evidence has one explicit row for all 55 criteria and 51 states', () => {
  const expectedAcceptance = new Set([...matrix.matchAll(/^\| (AC-[A-Z0-9]+) \|/gm)].map((match) => match[1]));
  const expectedStates = new Set([...states.matchAll(/^\| (CA-\d{2}) \|/gm)].map((match) => match[1]));
  const evidencedAcceptance = new Set([...evidence.matchAll(/^\| (AC-[A-Z0-9]+) \|/gm)].map((match) => match[1]));
  const evidencedStates = new Set([...evidence.matchAll(/^\| (CA-\d{2}) \|/gm)].map((match) => match[1]));
  assert.equal(expectedAcceptance.size, 55);
  assert.equal(expectedStates.size, 51);
  assert.deepEqual(evidencedAcceptance, expectedAcceptance);
  assert.deepEqual(evidencedStates, expectedStates);
  assert.match(evidence, /exactly 55 unique IDs/);
  assert.match(evidence, /exactly 51 unique states/);
});

test('production ledger never substitutes prototype evidence or hides pending live gates', () => {
  assert.match(evidence, /production `app\/` and `backend\/` implementation/);
  assert.match(evidence, /prototype and its BQ-148 evidence are not used as production evidence/);
  assert.match(evidence, /PENDING-LIVE/);
  assert.match(evidence, /owner \*\*PASS \/ REVISE \/ PARK \/ ESCALATE\*\*/);
  assert.doesNotMatch(evidence, /prototype route\/state \+ automated audit/);
});
