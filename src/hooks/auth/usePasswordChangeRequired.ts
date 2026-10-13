import { useCallback, useSyncExternalStore } from 'react';
import { authStore } from '../../api/auth-store';
import { authApi } from '../../api/auth';
import { getLogger } from '../../utils/logging';

const logger = getLogger('usePasswordChangeRequired');

export interface UsePasswordChangeRequiredReturn {
  /**
   * True when the current user must change their password before
   * continuing — either because the login/profile payload already said so
   * (`user.password_change_required`), or because an API call has already
   * been rejected this session with 403 `password_change_required` (see
   * the HTTP-client handling in foundation-client.ts / client.ts).
   */
  required: boolean;
  /**
   * The URL to send the user to for the change-password flow, if the
   * backend resolved a per-user one. Null when the backend had none to
   * offer (the consumer should then render an in-place form instead of
   * redirecting — see the JSON 403 contract).
   */
  changePasswordUrl: string | null;
  /**
   * Wraps `authApi.changePassword` and clears the requirement (both the
   * 403-derived store flag and the cached user's own field) on success, so
   * the consumer doesn't have to remember to do it manually. Rejects (and
   * leaves the requirement set) exactly like the underlying call.
   */
  changePassword: (
    oldPassword: string,
    newPassword: string
  ) => Promise<{ success: boolean; message: string }>;
}

/**
 * Reactive view over the forced-password-change state.
 *
 * Thin wrapper over the singleton `authStore`, same pattern as `useAuth`:
 * every call site observes the same state, with no provider to mount.
 */
export function usePasswordChangeRequired(): UsePasswordChangeRequiredReturn {
  const { user, passwordChangeRequired, changePasswordUrl } = useSyncExternalStore(
    authStore.subscribe,
    authStore.getSnapshot,
    authStore.getServerSnapshot
  );

  // Either source can assert the requirement: the login/profile payload
  // (`user.password_change_required`), sourced at login time before any
  // request has 403'd, or the store flag a 403 sets later in the session.
  const required = passwordChangeRequired || !!user?.password_change_required;

  const changePassword = useCallback(
    async (oldPassword: string, newPassword: string) => {
      const result = await authApi.changePassword(oldPassword, newPassword);
      // Clear both sources: the 403-derived store flag, and the cached
      // user's own field — otherwise a stale `password_change_required: true`
      // carried over from the login payload would keep `required` true after
      // a successful rotation.
      authStore.clearPasswordChangeRequired();
      if (user) {
        authStore.setUser({ ...user, password_change_required: false });
      }
      logger.info('Password changed; forced-change requirement cleared');
      return result;
    },
    [user]
  );

  return { required, changePasswordUrl, changePassword };
}
