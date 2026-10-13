import { storage } from '../utils/storage';
import { getLogger } from '../utils/logging';
import { PASSWORD_CHANGE_REQUIRED } from '../types/auth';
import type { User } from '../types/auth';

const logger = getLogger('auth-store');

/**
 * Module-level subscribable auth store (singleton).
 *
 * This is the single reactive source of truth for auth state across the app.
 * It is exposed to React via `useSyncExternalStore` (see useAuth), NOT a React
 * Context provider, so every call site observes the same state with no provider
 * wiring.
 *
 * CRITICAL: this module MUST NOT import the HTTP clients (client.ts /
 * foundation-client.ts) or profileApi. The clients import THIS module to funnel
 * 401s into `deauth()`; importing them back would create a circular dependency.
 * The store only touches `storage`, its own state, and its subscribers. Backend
 * revalidation (getProfile) lives in the hook layer, not here.
 */

export interface AuthSnapshot {
  /** Current user, or null if unauthenticated. */
  user: User | null;
  /**
   * True once auth state has been definitively settled (backend revalidation
   * succeeded, failed, or there was no local session). Before this, `user` is
   * only the optimistic value seeded from localStorage and must NOT be trusted
   * by guards to mean "definitively unauthenticated".
   */
  authResolved: boolean;
  /**
   * True once either HTTP client has seen a 403 `password_change_required`
   * response for the current session. Set by `notifyPasswordChangeRequired`,
   * NEVER by a 401 path — the user stays authenticated throughout (see
   * foundation-client.ts / client.ts, which deliberately do not deauth on
   * this code). Cleared by `clearPasswordChangeRequired` (a successful
   * change-password call) and by `deauth` (a fresh session starts clean).
   */
  passwordChangeRequired: boolean;
  /** The URL to redirect to for the change-password flow, if the backend
   *  resolved one. Null when the backend had no per-user URL to offer. */
  changePasswordUrl: string | null;
}

type Listener = () => void;

// Stable, SSR-safe snapshot: always the same object identity so
// useSyncExternalStore's getServerSnapshot never triggers an infinite loop.
const SERVER_SNAPSHOT: AuthSnapshot = Object.freeze({
  user: null,
  authResolved: false,
  passwordChangeRequired: false,
  changePasswordUrl: null,
});

// Synchronously seed the initial client snapshot from localStorage so the very
// first render already knows the optimistic auth state (prevents guard flicker).
function readInitialUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = storage.getUser();
    return stored?.user_id ? stored : null;
  } catch {
    return null;
  }
}

let snapshot: AuthSnapshot = Object.freeze({
  user: readInitialUser(),
  authResolved: false,
  passwordChangeRequired: false,
  changePasswordUrl: null,
});

const listeners = new Set<Listener>();

function emit(): void {
  for (const listener of listeners) listener();
}

function setSnapshot(next: AuthSnapshot): void {
  // Only replace + notify on a real change so useSyncExternalStore stays stable.
  if (
    next.user === snapshot.user &&
    next.authResolved === snapshot.authResolved &&
    next.passwordChangeRequired === snapshot.passwordChangeRequired &&
    next.changePasswordUrl === snapshot.changePasswordUrl
  ) {
    return;
  }
  snapshot = Object.freeze(next);
  emit();
}

export const authStore = {
  /** Current client snapshot (stable identity until a real change). */
  getSnapshot(): AuthSnapshot {
    return snapshot;
  },

  /** SSR snapshot: constant unauthenticated/unresolved state. */
  getServerSnapshot(): AuthSnapshot {
    return SERVER_SNAPSHOT;
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  /** Authenticate / refresh the current user. Does not touch authResolved. */
  setUser(user: User | null): void {
    setSnapshot({ ...snapshot, user });
  },

  /**
   * Force a logout: clear the stored user + JWT, set user null, mark resolved,
   * and notify subscribers. Called by both HTTP clients on a 401 for protected
   * endpoints, and by the hook's logout().
   *
   * Also clears passwordChangeRequired/changePasswordUrl: a fresh session
   * (the next login) starts from a clean slate and re-derives the flag from
   * that login's own payload / 403s, rather than carrying over state from the
   * previous session.
   */
  deauth(): void {
    try {
      storage.clearUser();
      storage.clearToken();
    } catch {
      // storage helpers already swallow their own errors; guard defensively.
    }
    logger.info('De-authenticated (cleared session)');
    setSnapshot({
      user: null,
      authResolved: true,
      passwordChangeRequired: false,
      changePasswordUrl: null,
    });
  },

  /** Mark auth state as definitively resolved (revalidation settled). */
  markResolved(): void {
    if (snapshot.authResolved) return;
    setSnapshot({ ...snapshot, authResolved: true });
  },

  /**
   * Record that the backend rejected a request with 403
   * `password_change_required`. Called by the HTTP clients. Deliberately
   * does NOT touch `user` or `authResolved` — the session stays logged in,
   * only forbidden until the user rotates their password (see FE-WP2 /
   * the 403 contract).
   */
  notifyPasswordChangeRequired(changePasswordUrl: string | null): void {
    setSnapshot({ ...snapshot, passwordChangeRequired: true, changePasswordUrl });
  },

  /**
   * Clear the flag after a successful password change (authApi.changePassword
   * resolves). Idempotent / cheap to call even when nothing was set.
   */
  clearPasswordChangeRequired(): void {
    if (!snapshot.passwordChangeRequired && snapshot.changePasswordUrl === null) return;
    setSnapshot({ ...snapshot, passwordChangeRequired: false, changePasswordUrl: null });
  },
};

/**
 * Duck-types an error thrown by either HTTP client (`FoundationApiError` from
 * foundation-client.ts, `ApiError` from client.ts) to detect the 403
 * `password_change_required` case, without either client importing the
 * other's error class. Both classes expose `.status: number` and
 * `.code: string | null`.
 */
export function isPasswordChangeRequired(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const status = (err as { status?: unknown }).status;
  const code = (err as { code?: unknown }).code;
  return status === 403 && code === PASSWORD_CHANGE_REQUIRED;
}
