const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? 'http://localhost:8000';

// D-051/BQ-013: the backend's WHICH-stage surfacing engine returns a mechanical
// {product_type, reason} pair — never natural-language teaching copy (that's the LLM's
// job in /chat). This lib fetches those candidates for the Home tutor card.
export interface SurfacingCandidate {
  product_type: string;
  reason: string;
}

export async function fetchSurfacingCandidates(userId: string): Promise<SurfacingCandidate[]> {
  const res = await fetch(`${BACKEND_URL}/surfacing-candidates?user_id=${userId}`);
  if (!res.ok) {
    throw new Error(`Backend responded ${res.status}`);
  }
  return (await res.json()) as SurfacingCandidate[];
}
