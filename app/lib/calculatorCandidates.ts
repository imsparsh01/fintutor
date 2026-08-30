import type { ScenarioCandidate, ScenarioCandidateGroup } from './scenarioCandidates';

export type CalculatorCandidateOffer = { total: number | null; candidates: ScenarioCandidate[] };

export function buildCalculatorCandidateOffer(group: ScenarioCandidateGroup): CalculatorCandidateOffer | null {
  if (!group.candidates.length) return null;
  const available = group.candidates.filter((candidate) =>
    candidate.value_status === 'available'
    && candidate.original_value !== null
    && Number.isFinite(candidate.original_value)
    && candidate.original_value >= 0,
  );
  return {
    total: available.length
      ? available.reduce((sum, candidate) => sum + candidate.original_value!, 0)
      : null,
    candidates: group.candidates,
  };
}
