import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { foundationRequest } from '../api/foundation-client';
import { authStore, isPasswordChangeRequired } from '../api/auth-store';
import { storage } from '../utils/storage';

// Mock the toast surface so tests don't depend on toast wiring.
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

describe('foundationRequest 403 password_change_required', () => {
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

  it('(a) 403 password_change_required does NOT deauth: session stays intact', async () => {
    mockFetchOnce(403, {
      success: false,
      error: 'password_change_required',
      message: 'You must change your password before continuing.',
      change_password_url: '/account/change-password',
    });

    await expect(foundationRequest('/api/users/profile')).rejects.toThrow();

    // Unlike the 401 path, storage/session must be left intact.
    expect(localStorage.getItem('auth_token')).toBe('valid-token');
    expect(localStorage.getItem('user')).not.toBeNull();
    expect(authStore.getSnapshot().user).not.toBeNull();

    // But the store records the requirement + resolved URL for consumers.
    expect(authStore.getSnapshot().passwordChangeRequired).toBe(true);
    expect(authStore.getSnapshot().changePasswordUrl).toBe('/account/change-password');
  });

  it('(b) 403 with change_password_url: null is recorded as null, not missing', async () => {
    mockFetchOnce(403, {
      success: false,
      error: 'password_change_required',
      message: 'You must change your password before continuing.',
      change_password_url: null,
    });

    await expect(foundationRequest('/api/users/profile')).rejects.toThrow();

    expect(authStore.getSnapshot().passwordChangeRequired).toBe(true);
    expect(authStore.getSnapshot().changePasswordUrl).toBeNull();
  });

  it('(c) the thrown error is detected by isPasswordChangeRequired', async () => {
    mockFetchOnce(403, {
      error: 'password_change_required',
      message: 'nope',
      change_password_url: '/change-password',
    });

    let caught: unknown;
    try {
      await foundationRequest('/api/users/profile');
    } catch (err) {
      caught = err;
    }

    expect(isPasswordChangeRequired(caught)).toBe(true);
  });

  it('(d) a plain 403 (different code) does NOT set passwordChangeRequired', async () => {
    mockFetchOnce(403, { error: 'forbidden' });

    await expect(foundationRequest('/api/users/profile')).rejects.toThrow();

    expect(authStore.getSnapshot().passwordChangeRequired).toBe(false);
    expect(authStore.getSnapshot().user).not.toBeNull();
  });

  it('(e) a 401 still deauths and does not set passwordChangeRequired', async () => {
    mockFetchOnce(401, { error: 'disabled' });

    await expect(foundationRequest('/api/users/profile')).rejects.toThrow();

    expect(authStore.getSnapshot().user).toBeNull();
    expect(authStore.getSnapshot().passwordChangeRequired).toBe(false);
  });
});
