const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? 'http://localhost:8000';

export interface Holding {
  id: string;
  product_type: string;
  alias: string;
  display_name: string | null;
  characteristics: Record<string, unknown>;
  reconciliation?: {
    status: 'new' | 'updated' | 'contradiction';
    product_type: string;
    changed_fields: string[];
  };
}

export interface HoldingUpdate {
  product_type?: string;
  alias?: string;
  display_name?: string | null;
  characteristics?: Record<string, unknown>;
}

// D-074: no alias field — the backend generates one. Used only by the manual add-holding
// flow; direct API callers may still supply their own alias via a raw request.
export interface HoldingCreate {
  product_type: string;
  display_name?: string | null;
  characteristics?: Record<string, unknown>;
}

export async function fetchHoldings(userId: string): Promise<Holding[]> {
  const res = await fetch(`${BACKEND_URL}/holdings?user_id=${userId}`);
  if (!res.ok) {
    throw new Error(`Backend responded ${res.status}`);
  }
  return (await res.json()) as Holding[];
}

export async function createHolding(userId: string, data: HoldingCreate): Promise<Holding> {
  const res = await fetch(`${BACKEND_URL}/holdings?user_id=${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`Backend responded ${res.status}`);
  }
  return (await res.json()) as Holding;
}

export async function updateHolding(
  userId: string,
  holdingId: string,
  updates: HoldingUpdate
): Promise<Holding> {
  const res = await fetch(`${BACKEND_URL}/holdings/${holdingId}?user_id=${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    throw new Error(`Backend responded ${res.status}`);
  }
  return (await res.json()) as Holding;
}

export async function deleteHolding(userId: string, holdingId: string): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/holdings/${holdingId}?user_id=${userId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`Backend responded ${res.status}`);
  }
}
