// @ts-nocheck
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const client = readFileSync(new URL('./esopExerciseCost.ts', import.meta.url), 'utf8');
const modal = readFileSync(
  new URL('../components/EsopExerciseCostModal.tsx', import.meta.url),
  'utf8'
);

test('ESOP client carries authoritative date, FMV-basis and source evidence', () => {
  assert.match(client, /calculation_timezone:\s*'Asia\/Kolkata'/);
  assert.match(client, /fmv_basis_label:\s*'Recorded FMV'/);
  assert.match(client, /source_version:\s*number/);
  assert.match(client, /retrieved_at:\s*string/);
  assert.match(client, /freshness:\s*'unavailable'/);
});

test('ESOP result labels its paper spread from the backend-recorded FMV basis', () => {
  assert.match(modal, /Paper spread using \{result\.fmv_basis_label\}/);
  assert.doesNotMatch(modal, /Taxable spread if exercised today/);
});
