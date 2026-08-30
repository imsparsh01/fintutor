// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import { buildCalculatorCandidateOffer } from './calculatorCandidates.ts';

const candidate = (overrides = {}) => ({
  source_kind: 'holding', source_record_id: 'record-1', source_label: 'Fixed deposit',
  source_fields: ['principal_or_monthly_amount'], source_version: 3, record_updated_at: null,
  retrieved_at: '2026-08-31T00:00:00Z', status: 'fresh', status_note: '', freshness: 'unavailable',
  freshness_note: 'Freshness unavailable', value_status: 'available', editable: true, included: false,
  original_value: 25000, unit: 'INR', product_type: 'fd_rd', ...overrides,
});

test('empty group remains an absent candidate rather than a recorded zero', () => {
  assert.equal(buildCalculatorCandidateOffer({ absent: true, candidates: [] }), null);
});

test('available recorded components sum while evidence remains component-level', () => {
  const offer = buildCalculatorCandidateOffer({ absent: false, candidates: [candidate(), candidate({ source_record_id: 'record-2', original_value: 15000 })] });
  assert.equal(offer.total, 40000);
  assert.equal(offer.candidates.length, 2);
  assert.equal(offer.candidates[0].source_version, 3);
});

test('malformed or unavailable components never become zero-valued inputs', () => {
  const offer = buildCalculatorCandidateOffer({ absent: false, candidates: [candidate({ value_status: 'malformed', original_value: null })] });
  assert.equal(offer.total, null);
  assert.equal(offer.candidates[0].value_status, 'malformed');
});
