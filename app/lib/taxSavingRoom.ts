import { authenticatedFetch, BACKEND_URL } from './backend';

export interface TaxSavingRoomResult {
  applicable: boolean;
  note: string;
  known_contributions?: number;
  unused_room: number | null;
  cap?: number;
}

// D-070/BRIEF-016: never a rupee tax-savings figure, stops at unused 80C room.
// tax_regime is a one-off input, never stored — the user answers it fresh each time.
export async function fetchTaxSavingRoom(
  userId: string,
  taxRegime: 'old' | 'new'
): Promise<TaxSavingRoomResult> {
  const params = new URLSearchParams({ tax_regime: taxRegime });
  const res = await authenticatedFetch(`${BACKEND_URL}/tax-saving-room?${params.toString()}`);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail ?? `Backend responded ${res.status}`);
  }
  return (await res.json()) as TaxSavingRoomResult;
}
