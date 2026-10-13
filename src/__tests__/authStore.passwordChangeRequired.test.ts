import { describe, it, expect, beforeEach } from 'vitest';
import { authStore, isPasswordChangeRequired } from '../api/auth-store';

describe('authStore password-change-required state', () => {
  beforeEach(() => {
    authStore.deauth();
    authStore.setUser(null);
  });

  it('notifyPasswordChangeRequired sets the flag + URL without touching user/authResolved', () => {
    authStore.setUser({ user_id: 'u1', email: 'a@b.c' } as any);
    const before = authStore.getSnapshot();

    authStore.notifyPasswordChangeRequired('/account/change-password');

    const after = authStore.getSnapshot();
    expect(after.passwordChangeRequired).toBe(true);
    expect(after.changePasswordUrl).toBe('/account/change-password');
    expect(after.user).toEqual(before.user);
    expect(after.authResolved).toBe(before.authResolved);
  });

  it('notifyPasswordChangeRequired(null) records null, not a missing URL', () => {
    authStore.notifyPasswordChangeRequired(null);
    expect(authStore.getSnapshot().passwordChangeRequired).toBe(true);
    expect(authStore.getSnapshot().changePasswordUrl).toBeNull();
  });

  it('clearPasswordChangeRequired resets both fields', () => {
    authStore.notifyPasswordChangeRequired('/cp');
    authStore.clearPasswordChangeRequired();

    expect(authStore.getSnapshot().passwordChangeRequired).toBe(false);
    expect(authStore.getSnapshot().changePasswordUrl).toBeNull();
  });

  it('deauth also clears passwordChangeRequired/changePasswordUrl (fresh session, clean slate)', () => {
    authStore.setUser({ user_id: 'u1', email: 'a@b.c' } as any);
    authStore.notifyPasswordChangeRequired('/cp');

    authStore.deauth();

    expect(authStore.getSnapshot().passwordChangeRequired).toBe(false);
    expect(authStore.getSnapshot().changePasswordUrl).toBeNull();
    expect(authStore.getSnapshot().user).toBeNull();
  });

  describe('isPasswordChangeRequired', () => {
    it('detects a duck-typed { status: 403, code: "password_change_required" } error', () => {
      expect(isPasswordChangeRequired({ status: 403, code: 'password_change_required' })).toBe(true);
    });

    it('rejects a 403 with a different code', () => {
      expect(isPasswordChangeRequired({ status: 403, code: 'forbidden' })).toBe(false);
    });

    it('rejects a 401 with the same code (should never happen, but must not misfire)', () => {
      expect(isPasswordChangeRequired({ status: 401, code: 'password_change_required' })).toBe(false);
    });

    it('rejects non-objects and nullish values', () => {
      expect(isPasswordChangeRequired(null)).toBe(false);
      expect(isPasswordChangeRequired(undefined)).toBe(false);
      expect(isPasswordChangeRequired('oops')).toBe(false);
      expect(isPasswordChangeRequired(new Error('plain error'))).toBe(false);
    });
  });
});
