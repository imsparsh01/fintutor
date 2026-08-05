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

export async function askQuestion(
  userId: string,
  question: string,
  deepenAlias?: string
): Promise<string> {
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
  const data = (await res.json()) as { response: string };
  return data.response;
}
