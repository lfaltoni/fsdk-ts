import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// API-FIRST WP7: a consumer can turn off ambient credentials and the CSRF round-trip
// (apiCredentials / apiCsrf / foundationCredentials on initEnv). Defaults are today's
// behaviour, so BlogMachine and every other consumer that does not opt in is unchanged.

vi.mock('../api/response-toast', () => ({ surfaceToast: vi.fn() }));

type FetchMock = ReturnType<typeof vi.fn>;

function okJson(body: unknown) {
  return { ok: true, status: 200, json: async () => body };
}

async function freshModules() {
  vi.resetModules();
  const env = await import('../utils/env');
  const client = await import('../api/client');
  const foundation = await import('../api/foundation-client');
  env.initEnv({ apiUrl: 'https://api.test', foundationUrl: 'https://f.test', loginPath: '/login' });
  return { env, client, foundation };
}

describe('apiRequest credentials + CSRF', () => {
  let fetchMock: FetchMock;

  beforeEach(() => {
    localStorage.clear();
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });
  afterEach(() => vi.restoreAllMocks());

  it('default: a mutating call fetches a CSRF token and sends credentials (unchanged)', async () => {
    const { client } = await freshModules();
    fetchMock.mockResolvedValueOnce(okJson({ csrfToken: 'tok' }));
    fetchMock.mockResolvedValueOnce(okJson({ ok: 1 }));
    await client.apiRequest('/api/v1/x', { method: 'POST', body: '{}' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.test/api/v1/csrf-token');
    expect(fetchMock.mock.calls[0][1].credentials).toBe('include');
    const [, init] = fetchMock.mock.calls[1];
    expect(init.credentials).toBe('include');
    expect(init.headers['X-CSRFToken']).toBe('tok');
  });

  it("apiCredentials 'omit' + apiCsrf false: one fetch, no cookie, no CSRF header", async () => {
    const { env, client } = await freshModules();
    env.initEnv({ apiCredentials: 'omit', apiCsrf: false });
    fetchMock.mockResolvedValueOnce(okJson({ ok: 1 }));
    await client.apiRequest('/api/v1/x', { method: 'POST', body: '{}' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.test/api/v1/x');
    expect(init.credentials).toBe('omit');
    expect(init.headers['X-CSRFToken']).toBeUndefined();
  });

  it('apiCsrf false alone skips the CSRF fetch even with credentials', async () => {
    const { env, client } = await freshModules();
    env.initEnv({ apiCsrf: false });
    fetchMock.mockResolvedValueOnce(okJson({ ok: 1 }));
    await client.apiRequest('/api/v1/x', { method: 'DELETE' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][1].credentials).toBe('include');
    expect(fetchMock.mock.calls[0][1].headers['X-CSRFToken']).toBeUndefined();
  });

  it('a per-call credentials option still wins over the configured default', async () => {
    const { env, client } = await freshModules();
    env.initEnv({ apiCredentials: 'omit', apiCsrf: false });
    fetchMock.mockResolvedValueOnce(okJson({ ok: 1 }));
    await client.apiRequest('/api/v1/x', { credentials: 'same-origin' });
    expect(fetchMock.mock.calls[0][1].credentials).toBe('same-origin');
  });

  it('GETs never fetch a CSRF token (unchanged)', async () => {
    const { client } = await freshModules();
    fetchMock.mockResolvedValueOnce(okJson({ ok: 1 }));
    await client.apiRequest('/api/v1/x');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('foundationRequest credentials', () => {
  let fetchMock: FetchMock;
  beforeEach(() => {
    localStorage.clear();
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });
  afterEach(() => vi.restoreAllMocks());

  it("default 'include' (unchanged)", async () => {
    const { foundation } = await freshModules();
    fetchMock.mockResolvedValueOnce(okJson({ ok: 1 }));
    await foundation.foundationRequest('/api/users/profile');
    expect(fetchMock.mock.calls[0][1].credentials).toBe('include');
  });

  it("foundationCredentials 'omit' is honoured; a per-call option still wins", async () => {
    const { env, foundation } = await freshModules();
    env.initEnv({ foundationCredentials: 'omit' });
    fetchMock.mockResolvedValueOnce(okJson({ ok: 1 }));
    await foundation.foundationRequest('/api/users/profile');
    expect(fetchMock.mock.calls[0][1].credentials).toBe('omit');
    fetchMock.mockResolvedValueOnce(okJson({ ok: 1 }));
    await foundation.foundationRequest('/api/users/profile', { credentials: 'include' });
    expect(fetchMock.mock.calls[1][1].credentials).toBe('include');
  });
});

describe('FoundationApiError.code', () => {
  it('is the body error when it is a string, else null', async () => {
    const { foundation } = await freshModules();
    const E = foundation.FoundationApiError;
    expect(new E('m', 401, { error: 'unauthenticated' }).code).toBe('unauthenticated');
    expect(new E('m', 401, { code: 401 }).code).toBeNull();
    expect(new E('m', 401, { error: 42 } as any).code).toBeNull();
    expect(new E('m', 401, undefined as any).code).toBeNull();
  });
});
