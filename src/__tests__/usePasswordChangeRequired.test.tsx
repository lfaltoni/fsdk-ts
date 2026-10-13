import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePasswordChangeRequired } from '../hooks/auth/usePasswordChangeRequired';
import { authStore } from '../api/auth-store';
import { authApi } from '../api/auth';

vi.mock('../api/auth', () => ({
  authApi: {
    changePassword: vi.fn(),
    login: vi.fn(),
  },
}));

const changePasswordMock = authApi.changePassword as unknown as ReturnType<typeof vi.fn>;
const loginMock = authApi.login as unknown as ReturnType<typeof vi.fn>;

const VALID_USER = { user_id: 'u1', email: 'a@b.c' };

describe('usePasswordChangeRequired', () => {
  beforeEach(() => {
    changePasswordMock.mockReset();
    loginMock.mockReset();
    // Clean baseline: no user, no requirement.
    authStore.deauth();
    authStore.setUser(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('(a) defaults to not-required with no URL', () => {
    const { result } = renderHook(() => usePasswordChangeRequired());
    expect(result.current.required).toBe(false);
    expect(result.current.changePasswordUrl).toBeNull();
  });

  it('(b) required flips true when the store records a 403 (reflects HTTP-client handling)', () => {
    act(() => authStore.setUser(VALID_USER as any));
    const { result } = renderHook(() => usePasswordChangeRequired());
    expect(result.current.required).toBe(false);

    act(() => authStore.notifyPasswordChangeRequired('/account/change-password'));

    expect(result.current.required).toBe(true);
    expect(result.current.changePasswordUrl).toBe('/account/change-password');
  });

  it('(c) required is also true when sourced from the login payload (user.password_change_required)', () => {
    act(() => authStore.setUser({ ...VALID_USER, password_change_required: true } as any));

    const { result } = renderHook(() => usePasswordChangeRequired());

    expect(result.current.required).toBe(true);
    // No 403 happened yet, so the store never resolved a URL.
    expect(result.current.changePasswordUrl).toBeNull();
  });

  it('(d) a successful changePassword() clears both the store flag and the cached user field', async () => {
    act(() => authStore.setUser({ ...VALID_USER, password_change_required: true } as any));
    changePasswordMock.mockResolvedValueOnce({ success: true, message: 'changed' });
    loginMock.mockResolvedValueOnce({ ...VALID_USER, password_change_required: false });

    const { result } = renderHook(() => usePasswordChangeRequired());
    expect(result.current.required).toBe(true);

    await act(async () => {
      await result.current.changePassword('oldpw', 'newpw12345');
    });

    expect(changePasswordMock).toHaveBeenCalledWith('oldpw', 'newpw12345');
    await waitFor(() => {
      expect(result.current.required).toBe(false);
    });
    expect(authStore.getSnapshot().passwordChangeRequired).toBe(false);
    expect(authStore.getSnapshot().changePasswordUrl).toBeNull();
    expect(authStore.getSnapshot().user?.password_change_required).toBe(false);
  });

  it('(e) a failing changePassword() leaves the requirement set and propagates the rejection', async () => {
    act(() => authStore.setUser({ ...VALID_USER, password_change_required: true } as any));
    changePasswordMock.mockRejectedValueOnce(new Error('wrong old password'));

    const { result } = renderHook(() => usePasswordChangeRequired());

    await expect(
      act(async () => {
        await result.current.changePassword('wrong', 'newpw12345');
      })
    ).rejects.toThrow('wrong old password');

    expect(result.current.required).toBe(true);
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('(f) a successful changePassword() re-authenticates to mint a fresh token, since the change-password endpoint never returns one (regression test: fails before the fix, since authApi.login was never called and the old token was left stored)', async () => {
    act(() => authStore.setUser({ ...VALID_USER, password_change_required: true } as any));
    changePasswordMock.mockResolvedValueOnce({ success: true, message: 'changed' });
    loginMock.mockResolvedValueOnce({ ...VALID_USER, password_change_required: false });

    const { result } = renderHook(() => usePasswordChangeRequired());

    await act(async () => {
      await result.current.changePassword('oldpw', 'newpw12345');
    });

    expect(loginMock).toHaveBeenCalledWith({ email: VALID_USER.email, password: 'newpw12345' });
  });

  it('(g) a re-login failure after a successful changePassword() is swallowed: the call still resolves and the already-cleared requirement stays cleared', async () => {
    act(() => authStore.setUser({ ...VALID_USER, password_change_required: true } as any));
    changePasswordMock.mockResolvedValueOnce({ success: true, message: 'changed' });
    loginMock.mockRejectedValueOnce(new Error('network blip'));

    const { result } = renderHook(() => usePasswordChangeRequired());

    const outcome = await act(async () => result.current.changePassword('oldpw', 'newpw12345'));

    expect(outcome).toEqual({ success: true, message: 'changed' });
    expect(result.current.required).toBe(false);
  });
});
