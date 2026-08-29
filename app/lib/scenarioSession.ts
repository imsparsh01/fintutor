import type { ApiResponseError } from './apiResponse';
import type { Holding } from './holdings';
import type { ScenarioCandidate } from './scenarioCandidates';

export const INPUTS_CHANGED_NOTICE = 'Inputs changed — run again to see a result for these values.';

export type CandidateDraft = Omit<ScenarioCandidate, 'included'> & {
  key: string;
  included: boolean;
  draft: string;
  touched: boolean;
  pendingRecordedValue: number | null | undefined;
};

export function candidateKey(candidate: Pick<ScenarioCandidate, 'source_kind' | 'source_record_id' | 'source_fields'>): string {
  return `${candidate.source_kind}:${candidate.source_record_id}:${candidate.source_fields.join(',')}`;
}

export function createCandidateDrafts(candidates: ScenarioCandidate[]): CandidateDraft[] {
  return candidates.map((candidate) => ({
    ...candidate,
    key: candidateKey(candidate),
    included: false,
    draft: candidate.original_value === null ? '' : String(candidate.original_value),
    touched: false,
    pendingRecordedValue: undefined,
  }));
}

export function updateCandidateDraft(
  drafts: CandidateDraft[], key: string, update: Partial<Pick<CandidateDraft, 'included' | 'draft' | 'touched'>>,
): CandidateDraft[] {
  return drafts.map((draft) => draft.key === key ? { ...draft, ...update } : draft);
}

export function refreshCandidateDrafts(current: CandidateDraft[], next: ScenarioCandidate[]): CandidateDraft[] {
  const currentByKey = new Map(current.map((draft) => [draft.key, draft]));
  return next.map((candidate) => {
    const key = candidateKey(candidate);
    const prior = currentByKey.get(key);
    if (!prior) return createCandidateDrafts([candidate])[0];
    if (prior.touched) {
      return { ...prior, ...candidate, included: prior.included, draft: prior.draft, touched: true,
        pendingRecordedValue: candidate.original_value === prior.original_value ? undefined : candidate.original_value };
    }
    return { ...candidate, key, included: prior.included,
      draft: candidate.original_value === null ? '' : String(candidate.original_value), touched: false,
      pendingRecordedValue: undefined };
  });
}

export function acceptRecordedCandidate(draft: CandidateDraft): CandidateDraft {
  const value = draft.pendingRecordedValue === undefined ? draft.original_value : draft.pendingRecordedValue;
  return { ...draft, original_value: value ?? null, draft: value === null ? '' : String(value),
    touched: false, pendingRecordedValue: undefined };
}

export function resetCandidateDrafts(drafts: CandidateDraft[]): CandidateDraft[] {
  return drafts.map((draft) => ({ ...draft, included: false,
    draft: draft.original_value === null ? '' : String(draft.original_value), touched: false,
    pendingRecordedValue: undefined }));
}

export function includedCandidateTotal(
  drafts: CandidateDraft[],
  parse: (raw: string) => { value: number } | null,
): number | null {
  let total = 0;
  for (const draft of drafts) {
    if (!draft.included) continue;
    const parsed = parse(draft.draft);
    if (!parsed || parsed.value < 0) return null;
    total += parsed.value;
    if (!Number.isFinite(total)) return null;
  }
  return total;
}

function strictRecordedNumber(
  value: unknown,
  parse: (raw: string) => { value: number } | null,
): number | null {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  const parsed = parse(String(value));
  return parsed && parsed.value >= 0 ? parsed.value : null;
}

export function loanScenarioCandidates(
  holdings: Holding[],
  retrievedAt: string,
  parse: (raw: string) => { value: number } | null,
): ScenarioCandidate[] {
  return holdings.filter((holding) => holding.product_type === 'home_loan' || holding.product_type === 'personal_loan')
    .map((holding) => {
      const fields = ['outstanding_balance', 'interest_rate', 'tenure_months'];
      const values = fields.map((field) => strictRecordedNumber(holding.characteristics[field], parse));
      const complete = values.every((value) => value !== null);
      return {
        source_kind: 'holding' as const, source_record_id: holding.id,
        source_label: holding.display_name ?? holding.alias, source_fields: fields,
        source_version: holding.version, record_updated_at: null, retrieved_at: retrievedAt,
        status: complete ? 'unavailable' as const : 'malformed' as const,
        status_note: complete ? 'All three loan fields are available; freshness is unavailable.' : 'One or more loan fields need your input.',
        freshness: 'unavailable' as const, freshness_note: 'Freshness unavailable' as const,
        value_status: complete ? 'available' as const : 'malformed' as const,
        editable: true as const, included: false as const, original_value: null,
        unit: 'INR' as const, product_type: holding.product_type,
      };
    });
}

export function scenarioSourceFailure(error: unknown): 'permission' | 'retryable' {
  const status = (error as Partial<ApiResponseError> | null)?.status;
  return status === 401 || status === 403 ? 'permission' : 'retryable';
}
