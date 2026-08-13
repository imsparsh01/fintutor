import { authenticatedFetch, BACKEND_URL } from './backend';

// D-022: no conversation memory — each call is independent, carrying only the current
// question. The backend re-assembles the live baseline every time (D-001) but never
// receives prior turns. Any message history shown in the UI is local display state only,
// never sent back to the model.
// D-071: deepenAlias is set only by HoldingDetailScreen's "Ask about this" flow, which
// knows its holding's alias with certainty — never derived from the question text itself.
// User-facing copy only — never echoes the raw fetch/HTTP error, matching the backend's own
// posture of not leaking exception detail to the caller (main.py's /chat handler).
const GENERIC_ERROR = "Couldn't reach the teaching engine — try again in a moment.";

export type { HoldingProposal } from './holdingReconciliation';
import type { HoldingProposal } from './holdingReconciliation';

// BQ-042/D-084: present only on a call OnboardingScreen's ChatThread makes. `trackHint` mirrors
// D-071's deepenAlias pattern — a deterministic signal only the chip UI can supply with
// certainty; the backend only consults it while a user's track is still unset (onboarding.py).
// `lastAiMessage` (D-085): the one narrow exception to D-022 — the AI's own last message in
// this conversation, read from ChatThread's own local display state and forwarded so a
// short/referential reply can be understood in context. Never stored server-side.
export interface OnboardingRequest {
  trackHint?: string;
  lastAiMessage?: string;
}

export interface OnboardingState {
  track: string | null;
  stage: string | null;
}

export interface AskQuestionResult {
  response: string;
  holdingProposal: HoldingProposal | null;
  onboardingState: OnboardingState | null;
}

export async function askQuestion(
  userId: string,
  question: string,
  deepenAlias?: string,
  onboarding?: OnboardingRequest
): Promise<AskQuestionResult> {
  let res: Response;
  try {
    res = await authenticatedFetch(`${BACKEND_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        deepen_alias: deepenAlias ?? null,
        onboarding: onboarding !== undefined,
        onboarding_track_hint: onboarding?.trackHint ?? null,
        onboarding_last_ai_message: onboarding?.lastAiMessage ?? null,
      }),
    });
  } catch {
    throw new Error(GENERIC_ERROR);
  }
  if (!res.ok) {
    if (res.status === 422) {
      const payload = (await res.json().catch(() => null)) as { detail?: string } | null;
      if (payload?.detail) throw new Error(payload.detail);
    }
    throw new Error(GENERIC_ERROR);
  }
  const data = (await res.json()) as {
    response: string;
    holding_proposal: HoldingProposal | null;
    onboarding_state?: OnboardingState;
  };
  return {
    response: data.response,
    holdingProposal: data.holding_proposal,
    onboardingState: data.onboarding_state ?? null,
  };
}
