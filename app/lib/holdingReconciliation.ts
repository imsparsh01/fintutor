import { authenticatedFetch, BACKEND_URL } from './backend';
import type { Holding } from './holdings';

export type ReconciliationField = {
  field: string;
  status: 'added' | 'unchanged' | 'conflicting';
  stored_value: unknown;
  proposed_value: unknown;
};

export type ReconciliationCandidate = {
  id: string;
  alias: string;
  display_name: string | null;
  product_type: string;
};

export type HoldingProposal = {
  kind: 'new' | 'select' | 'update';
  product_type: string;
  characteristics: Record<string, unknown>;
  candidates: ReconciliationCandidate[];
  target: ReconciliationCandidate | null;
  diff: ReconciliationField[];
};

async function post<T>(path: string, userId: string, body: object): Promise<T> {
  const response = await authenticatedFetch(`${BACKEND_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const stale = payload?.detail?.proposal as HoldingProposal | undefined;
    if (response.status === 409 && stale) {
      const error = new Error(payload.detail.message ?? 'Review the refreshed comparison.');
      Object.assign(error, { refreshedProposal: stale });
      throw error;
    }
    throw new Error(typeof payload?.detail === 'string' ? payload.detail : 'The change could not be applied.');
  }
  return (await response.json()) as T;
}

export function resolveHoldingProposal(
  userId: string,
  proposal: HoldingProposal,
  targetId: string | null,
): Promise<HoldingProposal> {
  return post('/holding-reconciliation/resolve', userId, {
    product_type: proposal.product_type,
    characteristics: proposal.characteristics,
    target_id: targetId,
    add_as_new: targetId === null,
  });
}

export function applyHoldingProposal(userId: string, proposal: HoldingProposal): Promise<Holding> {
  return post('/holding-reconciliation/apply', userId, {
    product_type: proposal.product_type,
    characteristics: proposal.characteristics,
    target_id: proposal.target?.id ?? null,
    expected_diff: proposal.diff,
  });
}

export function refreshedProposalFrom(error: unknown): HoldingProposal | null {
  return error instanceof Error && 'refreshedProposal' in error
    ? (error as Error & { refreshedProposal: HoldingProposal }).refreshedProposal
    : null;
}
