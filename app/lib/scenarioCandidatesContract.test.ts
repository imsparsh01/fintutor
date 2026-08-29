// @ts-nocheck
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./scenarioCandidates.ts', import.meta.url), 'utf8');

test('Scenario candidate client exposes every authoritative component-evidence field', () => {
  for (const field of [
    'source_kind',
    'source_record_id',
    'source_label',
    'source_fields',
    'source_version',
    'record_updated_at',
    'retrieved_at',
    'status',
    'editable',
    'included',
    'original_value',
    'value_status',
    'freshness',
  ]) {
    assert.match(source, new RegExp(`${field}:`));
  }
});

test('Scenario candidate client carries all four approved groups and no total field', () => {
  for (const group of ['monthly_outgoings', 'monthly_sips', 'invested_corpus', 'fd_principal']) {
    assert.match(source, new RegExp(`${group}: ScenarioCandidateGroup`));
  }
  assert.doesNotMatch(source, /(?:monthly_outgoings|monthly_sips|invested_corpus|fd_principal)_total/);
  assert.match(source, /authenticatedFetch\(`\$\{BACKEND_URL\}\/scenario-candidates`\)/);
});
