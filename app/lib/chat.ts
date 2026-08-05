const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? 'http://localhost:8000';

// D-022: no conversation memory — each call is independent, carrying only the current
// question. The backend re-assembles the live baseline every time (D-001) but never
// receives prior turns. Any message history shown in the UI is local display state only,
// never sent back to the model.
// D-071: deepenAlias is set only by HoldingDetailScreen's "Ask about this" flow, which
// knows its holding's alias with certainty — never derived from the question text itself.
// User-facing copy only — never echoes the raw fetch/HTTP error, matching the backend's own
// posture of not leaking exception detail to the caller (main.py's /chat handler).
const GENERIC_ERROR = "Couldn't reach the teaching engine — try again in a moment.";

// D-078: a proposal is a read-only extraction from the user's own message — never written to
// the database by the backend. The caller must route Save through the existing createHolding
// (D-074/BQ-036) on an explicit user tap; there is no auto-create path anywhere in this type.
export interface HoldingProposal {
  product_type: string;
  characteristics: Record<string, unknown>;
}

export interface AskQuestionResult {
  response: string;
  holdingProposal: HoldingProposal | null;
}

export async function askQuestion(
  userId: string,
  question: string,
  deepenAlias?: string
): Promise<AskQuestionResult> {
  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}/chat?user_id=${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, deepen_alias: deepenAlias ?? null }),
    });
  } catch {
    throw new Error(GENERIC_ERROR);
  }
  if (!res.ok) {
    throw new Error(GENERIC_ERROR);
  }
  const data = (await res.json()) as { response: string; holding_proposal: HoldingProposal | null };
  return { response: data.response, holdingProposal: data.holding_proposal };
}
