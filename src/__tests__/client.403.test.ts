import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { apiRequest, ApiError } from '../api/client';
import { authStore, isPasswordChangeRequired } from '../api/auth-store';
import { storage } from '../utils/storage';

vi.mock('../api/response-toast', () => ({
  surfaceToast: vi.fn(),
}));

function mockFetchOnce(status: number, body: unknown) {
  (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

describe('apiRequest (:5000) 403 password_change_required', () => {
  beforeEach(() => {
    localStorage.clear();
    storage.setToken('valid-token');
    storage.setUser({ user_id: 'u1', email: 'a@b.c' } as any);
    authStore.setUser({ user_id: 'u1', email: 'a@b.c' } as any);
    // Reset leftover passwordChangeRequired/changePasswordUrl from a prior
    // test in this file (authStore is a module-level singleton).
    authStore.clearPasswordChangeRequired();
    globalThis.fetch = vi.fn() as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('(a) 403 password_change_required does NOT deauth the shared store', async () => {
    mockFetchOnce(403, {
      success: false,
      error: 'password_change_required',
      message: 'You must change your password before continuing.',
      change_password_url: '/account/change-password',
    });

    await expect(apiRequest('/api/v1/bookings')).rejects.toThrow();

    expect(authStore.getSnapshot().user).not.toBeNull();
    expect(localStorage.getItem('auth_token')).toBe('valid-token');
    expect(authStore.getSnapshot().passwordChangeRequired).toBe(true);
    expect(authStore.getSnapshot().changePasswordUrl).toBe('/account/change-password');
  });

  it('(b) the thrown ApiError carries status 403 + code, and isPasswordChangeRequired detects it', async () => {
    mockFetchOnce(403, { error: 'password_change_required', change_password_url: '/cp' });

    let caught: unknown;
    try {
      await apiRequest('/api/v1/bookings');
    } catch (err) {
      caught = err;
    }

    expect(caught).toBeInstanceOf(ApiError);
    expect((caught as ApiError).status).toBe(403);
    expect((caught as ApiError).code).toBe('password_change_required');
    expect(isPasswordChangeRequired(caught)).toBe(true);
  });

  it('(c) a plain 403 (different code) does NOT set passwordChangeRequired', async () => {
    mockFetchOnce(403, { error: 'forbidden' });

    await expect(apiRequest('/api/v1/bookings')).rejects.toThrow();

    expect(authStore.getSnapshot().passwordChangeRequired).toBe(false);
    expect(authStore.getSnapshot().user).not.toBeNull();
  });

  it('(d) a 401 still deauths and does not set passwordChangeRequired', async () => {
    mockFetchOnce(401, { error: 'unauthorized' });

    await expect(apiRequest('/api/v1/bookings')).rejects.toThrow();

    expect(authStore.getSnapshot().user).toBeNull();
    expect(authStore.getSnapshot().passwordChangeRequired).toBe(false);
  });
});
