// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import { acceptRecordedCandidate, createCandidateDrafts, includedCandidateTotal, loanScenarioCandidates, refreshCandidateDrafts, resetCandidateDrafts, scenarioSourceFailure, updateCandidateDraft } from './scenarioSession.ts';
import { parseScenarioNumber } from './scenarioNumbers.ts';

const candidate = (value = 0) => ({ source_kind:'holding', source_record_id:'h1', source_label:'Fund A',
  source_fields:['current_value'], source_version:1, record_updated_at:null, retrieved_at:'2026-08-29T00:00:00Z',
  status:'fresh', status_note:'Available', freshness:'unavailable', freshness_note:'Freshness unavailable',
  value_status:'available', editable:true, included:false, original_value:value, unit:'INR', product_type:'stocks' });

test('recorded candidates preserve real zero and start excluded', () => {
  const [draft] = createCandidateDrafts([candidate(0)]);
  assert.equal(draft.draft, '0'); assert.equal(draft.included, false); assert.equal(includedCandidateTotal([draft], parseScenarioNumber), 0);
});

test('included totals reject malformed input and never count excluded values', () => {
  let drafts = createCandidateDrafts([candidate(100), {...candidate(200), source_record_id:'h2'}]);
  drafts = updateCandidateDraft(drafts, drafts[0].key, { included:true });
  assert.equal(includedCandidateTotal(drafts, parseScenarioNumber), 100);
  drafts = updateCandidateDraft(drafts, drafts[0].key, { draft:'1e3', touched:true });
  assert.equal(includedCandidateTotal(drafts, parseScenarioNumber), null);
});

test('refresh updates untouched evidence but preserves edited draft until accepted', () => {
  const first = createCandidateDrafts([candidate(100)]);
  assert.equal(refreshCandidateDrafts(first, [candidate(120)])[0].draft, '120');
  const edited = updateCandidateDraft(first, first[0].key, { draft:'90', touched:true, included:true });
  const refreshed = refreshCandidateDrafts(edited, [candidate(120)])[0];
  assert.equal(refreshed.draft, '90'); assert.equal(refreshed.pendingRecordedValue, 120);
  assert.equal(acceptRecordedCandidate(refreshed).draft, '120');
});

test('reset excludes everything and restores recorded evidence', () => {
  const [reset] = resetCandidateDrafts([{...createCandidateDrafts([candidate(50)])[0], included:true, draft:'45', touched:true}]);
  assert.equal(reset.included, false); assert.equal(reset.draft, '50'); assert.equal(reset.touched, false);
});

test('loan candidates are eligible-only and never fall back from outstanding to principal', () => {
  const holdings = [
    {id:'home', product_type:'home_loan', alias:'Loan-A', display_name:null, version:2, characteristics:{principal:500,interest_rate:8,tenure_months:120}},
    {id:'card', product_type:'credit_card_debt', alias:'Card-A', display_name:null, version:1, characteristics:{outstanding_balance:50,interest_rate:20,tenure_months:12}},
  ];
  const result = loanScenarioCandidates(holdings, 'now', parseScenarioNumber);
  assert.equal(result.length, 1); assert.equal(result[0].status, 'malformed'); assert.equal(result[0].original_value, null);
});

test('complete loan evidence never claims fresh without a recorded update time', () => {
  const [result] = loanScenarioCandidates([{ id:'home', product_type:'home_loan', alias:'Loan-A',
    display_name:null, version:2, characteristics:{outstanding_balance:500,interest_rate:8,tenure_months:120} }],
  'now', parseScenarioNumber);
  assert.equal(result.status, 'unavailable'); assert.equal(result.freshness, 'unavailable');
});

test('only 401/403 source failures are permission failures', () => {
  assert.equal(scenarioSourceFailure({status:401}), 'permission');
  assert.equal(scenarioSourceFailure({status:403}), 'permission');
  assert.equal(scenarioSourceFailure({status:500}), 'retryable');
  assert.equal(scenarioSourceFailure(new Error('offline')), 'retryable');
});
