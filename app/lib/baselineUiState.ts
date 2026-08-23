export type BaselineStaleConflict<TCurrent = Record<string, unknown>, TProposed = Record<string, unknown>> = {
  current: TCurrent & { version: number };
  proposed: TProposed;
};

export type BaselineMutationState<TCurrent, TProposed> =
  | { status: 'idle' }
  | { status: 'saving'; proposed: TProposed }
  | { status: 'stale'; conflict: BaselineStaleConflict<TCurrent, TProposed> }
  | { status: 'saved'; current: TCurrent }
  | { status: 'failed'; proposed: TProposed; message: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Extracts the stable BQ-110 409 payload without treating arbitrary failures as stale. */
export function baselineStaleConflictFrom<TCurrent, TProposed>(
  value: unknown,
): BaselineStaleConflict<TCurrent, TProposed> | null {
  const candidate = isRecord(value) && 'detail' in value ? value.detail : value;
  if (!isRecord(candidate) || !isRecord(candidate.current) || !isRecord(candidate.proposed)) return null;
  if (!Number.isInteger(candidate.current.version) || (candidate.current.version as number) < 1) return null;
  return {
    current: candidate.current as TCurrent & { version: number },
    proposed: candidate.proposed as TProposed,
  };
}

export function beginBaselineMutation<TCurrent, TProposed>(
  proposed: TProposed,
): BaselineMutationState<TCurrent, TProposed> {
  return { status: 'saving', proposed };
}

export function settleBaselineMutation<TCurrent, TProposed>(
  proposed: TProposed,
  outcome: { ok: true; current: TCurrent } | { ok: false; error: unknown; message?: string },
): BaselineMutationState<TCurrent, TProposed> {
  if (outcome.ok) return { status: 'saved', current: outcome.current };
  const conflict = baselineStaleConflictFrom<TCurrent, TProposed>(outcome.error);
  if (conflict) return { status: 'stale', conflict };
  return { status: 'failed', proposed, message: outcome.message ?? 'The change could not be saved.' };
}

/** A stale retry must use the refreshed version and requires an explicit user action. */
export function reconfirmStaleMutation<TCurrent, TProposed>(
  state: BaselineMutationState<TCurrent, TProposed>,
): (TProposed & { expected_version: number }) | null {
  if (state.status !== 'stale') return null;
  return { ...state.conflict.proposed, expected_version: state.conflict.current.version };
}

export type RemovedCharacteristic = { key: string; label: string; value: unknown };

function hasMeaningfulValue(value: unknown): boolean {
  return value !== null && value !== undefined && value !== '';
}

/** Lists populated fields that cannot survive a product-type recategorisation. */
export function recategorisationFieldLoss(
  characteristics: Record<string, unknown>,
  destinationFields: ReadonlyArray<{ key: string }>,
): RemovedCharacteristic[] {
  const retainedKeys = new Set(destinationFields.map((field) => field.key));
  return Object.entries(characteristics)
    .filter(([key, value]) => !retainedKeys.has(key) && hasMeaningfulValue(value))
    .map(([key, value]) => ({ key, label: humaniseKey(key), value }));
}

function humaniseKey(key: string): string {
  return key.replaceAll('_', ' ').replace(/^./, (character) => character.toUpperCase());
}

export type HoldingReminderOutcome<THolding> =
  | { status: 'save_failed'; message: string }
  | { status: 'saved'; holding: THolding }
  | { status: 'saved_reminder_failed'; holding: THolding; reminderMessage: string; canRetryReminder: true };

/** A committed holding remains authoritative even when its optional local reminder fails. */
export function holdingReminderOutcome<THolding>(input:
  | { save: { ok: false; message: string } }
  | { save: { ok: true; holding: THolding }; reminder: 'not_needed' | 'scheduled' | { failed: string } }
): HoldingReminderOutcome<THolding> {
  if (!('reminder' in input)) return { status: 'save_failed', message: input.save.message };
  if (typeof input.reminder === 'object') {
    return {
      status: 'saved_reminder_failed',
      holding: input.save.holding,
      reminderMessage: input.reminder.failed,
      canRetryReminder: true,
    };
  }
  return { status: 'saved', holding: input.save.holding };
}

export type BaselineSectionResult<T> =
  | { status: 'loading' }
  | { status: 'available'; data: T }
  | { status: 'failed'; message: string };

export function baselineLoadSummary(
  sections: Record<string, BaselineSectionResult<unknown>>,
): { status: 'loading' | 'complete' | 'partial' | 'failed'; available: string[]; failed: string[] } {
  const entries = Object.entries(sections);
  const available = entries.filter(([, result]) => result.status === 'available').map(([key]) => key);
  const failed = entries.filter(([, result]) => result.status === 'failed').map(([key]) => key);
  if (entries.some(([, result]) => result.status === 'loading')) return { status: 'loading', available, failed };
  if (failed.length === 0) return { status: 'complete', available, failed };
  return { status: available.length === 0 ? 'failed' : 'partial', available, failed };
}

export type AccountRequestToken = { accountId: string; generation: number };

export class AccountRequestGeneration {
  private generation = 0;
  private accountId: string | null = null;

  begin(accountId: string): AccountRequestToken {
    this.accountId = accountId;
    this.generation += 1;
    return { accountId, generation: this.generation };
  }

  switchAccount(accountId: string | null): void {
    this.accountId = accountId;
    this.generation += 1;
  }

  isCurrent(token: AccountRequestToken): boolean {
    return token.accountId === this.accountId && token.generation === this.generation;
  }
}
