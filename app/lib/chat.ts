const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? 'http://localhost:8000';

// D-022: no conversation memory — each call is independent, carrying only the current
// question. The backend re-assembles the live baseline every time (D-001) but never
// receives prior turns. Any message history shown in the UI is local display state only,
// never sent back to the model.
export async function askQuestion(userId: string, question: string): Promise<string> {
  const res = await fetch(`${BACKEND_URL}/chat?user_id=${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) {
    throw new Error(`Backend responded ${res.status}`);
  }
  const data = (await res.json()) as { response: string };
  return data.response;
}
