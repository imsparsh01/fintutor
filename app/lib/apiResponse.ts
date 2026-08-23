export interface StaleWriteDetail<TCurrent, TProposed> {
  message: string;
  current: TCurrent;
  proposed: TProposed;
}

export class ApiResponseError<TDetail = unknown> extends Error {
  readonly status: number;
  readonly detail: TDetail;

  constructor(status: number, detail: TDetail, fallbackMessage = `Backend responded ${status}`) {
    const message = isMessageDetail(detail) ? detail.message : fallbackMessage;
    super(message);
    this.name = 'ApiResponseError';
    this.status = status;
    this.detail = detail;
  }
}

function isMessageDetail(value: unknown): value is { message: string } {
  return typeof value === 'object' && value !== null
    && typeof (value as { message?: unknown }).message === 'string';
}

export function isStaleWriteError<TCurrent, TProposed>(
  error: unknown,
): error is ApiResponseError<StaleWriteDetail<TCurrent, TProposed>> {
  if (!(error instanceof ApiResponseError) || error.status !== 409) return false;
  const detail = error.detail as Partial<StaleWriteDetail<TCurrent, TProposed>> | null;
  return detail !== null && typeof detail === 'object'
    && typeof detail.message === 'string'
    && 'current' in detail
    && 'proposed' in detail;
}

export async function readApiResponse<T>(response: Response): Promise<T> {
  const payload = await readPayload(response);
  if (!response.ok) {
    const detail = payload !== null && typeof payload === 'object' && 'detail' in payload
      ? (payload as { detail: unknown }).detail
      : payload;
    throw new ApiResponseError(response.status, detail);
  }
  return payload as T;
}

async function readPayload(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}
