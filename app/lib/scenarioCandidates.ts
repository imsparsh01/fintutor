import { readApiResponse } from './apiResponse';
import { authenticatedFetch, BACKEND_URL } from './backend';

export type ScenarioCandidateStatus = 'fresh' | 'stale' | 'unavailable' | 'malformed';
export type ScenarioCandidateValueStatus = 'available' | 'unavailable' | 'malformed';

export interface ScenarioCandidate {
  source_kind: 'holding' | 'discretionary_category';
  source_record_id: string;
  source_label: string;
  source_fields: string[];
  source_version: number;
  record_updated_at: null;
  retrieved_at: string;
  status: ScenarioCandidateStatus;
  status_note: string;
  freshness: 'unavailable';
  freshness_note: 'Freshness unavailable';
  value_status: ScenarioCandidateValueStatus;
  editable: true;
  included: false;
  original_value: number | null;
  unit: 'INR' | 'INR/month';
  product_type: string | null;
}

export interface ScenarioCandidateGroup {
  absent: boolean;
  candidates: ScenarioCandidate[];
}

export interface ScenarioCandidatesResponse {
  retrieved_at: string;
  freshness: 'unavailable';
  freshness_note: 'Freshness unavailable';
  monthly_outgoings: ScenarioCandidateGroup;
  monthly_sips: ScenarioCandidateGroup;
  invested_corpus: ScenarioCandidateGroup;
  fd_principal: ScenarioCandidateGroup;
}

export async function fetchScenarioCandidates(): Promise<ScenarioCandidatesResponse> {
  const response = await authenticatedFetch(`${BACKEND_URL}/scenario-candidates`);
  return readApiResponse<ScenarioCandidatesResponse>(response);
}
