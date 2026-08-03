import { pingBackendHealth } from './backend';

describe('pingBackendHealth', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('returns ok with the reported status when the backend responds 200', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: 'ok' }),
    }) as unknown as typeof fetch;

    const result = await pingBackendHealth();
    expect(result).toEqual({ ok: true, detail: 'ok' });
  });

  it('falls back to "ok" when the response body has no status field', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    }) as unknown as typeof fetch;

    const result = await pingBackendHealth();
    expect(result).toEqual({ ok: true, detail: 'ok' });
  });

  it('returns ok:false with the HTTP status when the backend responds with an error status', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({}),
    }) as unknown as typeof fetch;

    const result = await pingBackendHealth();
    expect(result).toEqual({ ok: false, detail: 'Backend responded 503' });
  });

  it('returns ok:false with the error message when fetch throws', async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new Error('Network request failed')) as unknown as typeof fetch;

    const result = await pingBackendHealth();
    expect(result).toEqual({ ok: false, detail: 'Network request failed' });
  });

  it('returns a generic message when fetch throws a non-Error value', async () => {
    globalThis.fetch = jest.fn().mockRejectedValue('some string rejection') as unknown as typeof fetch;

    const result = await pingBackendHealth();
    expect(result).toEqual({ ok: false, detail: 'Unknown error reaching backend' });
  });
});
