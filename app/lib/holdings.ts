const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? 'http://localhost:8000';

export interface Holding {
  id: string;
  product_type: string;
  alias: string;
  display_name: string | null;
  characteristics: Record<string, unknown>;
}

export async function fetchHoldings(userId: string): Promise<Holding[]> {
  const res = await fetch(`${BACKEND_URL}/holdings?user_id=${userId}`);
  if (!res.ok) {
    throw new Error(`Backend responded ${res.status}`);
  }
  return (await res.json()) as Holding[];
}
