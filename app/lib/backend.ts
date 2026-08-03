const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? 'http://localhost:8000';

export async function pingBackendHealth(): Promise<{ ok: boolean; detail: string }> {
  try {
    const res = await fetch(`${BACKEND_URL}/health`);
    if (!res.ok) {
      return { ok: false, detail: `Backend responded ${res.status}` };
    }
    const data = (await res.json()) as { status?: string };
    return { ok: true, detail: data.status ?? 'ok' };
  } catch (err) {
    return {
      ok: false,
      detail: err instanceof Error ? err.message : 'Unknown error reaching backend',
    };
  }
}
