import { authenticatedFetch, BACKEND_URL } from './backend';

export interface DiscretionaryCategory {
  id: string;
  label: string;
  planned_amount: number;
}

export async function fetchDiscretionaryCategories(
  userId: string
): Promise<DiscretionaryCategory[]> {
  const res = await authenticatedFetch(`${BACKEND_URL}/discretionary-categories`);
  if (!res.ok) {
    throw new Error(`Backend responded ${res.status}`);
  }
  return (await res.json()) as DiscretionaryCategory[];
}

export async function createDiscretionaryCategory(
  userId: string,
  label: string,
  plannedAmount: number
): Promise<DiscretionaryCategory> {
  const res = await authenticatedFetch(`${BACKEND_URL}/discretionary-categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label, planned_amount: plannedAmount }),
  });
  if (!res.ok) {
    throw new Error(`Backend responded ${res.status}`);
  }
  return (await res.json()) as DiscretionaryCategory;
}
