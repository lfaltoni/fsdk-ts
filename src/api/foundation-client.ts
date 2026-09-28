import { getLogger } from '../utils/logging';
import { getEnvConfig } from '../utils/env';
import { storage } from '../utils/storage';
import { authStore } from './auth-store';
import { surfaceToast } from './response-toast';

const logger = getLogger('foundation-client');


/**
 * An HTTP error from a foundation-sdk endpoint, carrying the structured body.
 *
 * It is still an `Error` with the same `.message`, so existing `catch` blocks
 * are unaffected. What it adds is the part the backend now sends and a plain
 * `Error` threw away: `errors.rejected_keys` on a 422 from
 * `PUT /api/users/profile`. The SDK refuses undeclared/reserved profile keys
 * instead of silently dropping them — a client that cannot read WHICH keys were
 * refused just reintroduces the silent drop at the frontend.
 */
export class FoundationApiError extends Error {
  readonly status: number;
  readonly body: Record<string, any>;

  constructor(message: string, status: number, body: Record<string, any>) {
    super(message);
    this.name = 'FoundationApiError';
    this.status = status;
    this.body = body ?? {};
  }

  /** The machine-readable error code (`body.error`) when the server sent one as a
   *  string, else null. Additive: Bookease's error envelope puts its code there. */
  get code(): string | null {
    const error = this.body?.error;
    return typeof error === 'string' ? error : null;
  }

  /** Field names the server refused (422 from the profile endpoint). */
  get rejectedKeys(): string[] {
    const errors = this.body?.errors;
    const keys = errors && (errors as Record<string, unknown>).rejected_keys;
    return Array.isArray(keys) ? (keys as string[]) : [];
  }
}


/**
 * Make a request to the Foundation SDK server (auth, profiles, media).
 *
 * This is separate from `apiRequest` (Bookease-Pro) because the Foundation
 * server does NOT use Flask-WTF CSRF — it has its own session management
 * via Flask-Login.
 */
export async function foundationRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${getEnvConfig().foundationUrl}${endpoint}`;
  const method = (options.method || 'GET').toUpperCase();
  const startTime = Date.now();

  logger.logApiRequest(method, url, options.body);

  try {
    const token = storage.getToken();
    const response = await fetch(url, {
      credentials: getEnvConfig().foundationCredentials ?? 'include',
      ...options,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...(options.headers as Record<string, string>),
      },
    });

    const duration = Date.now() - startTime;
    const data = await response.json();

    logger.logApiResponse(response.status, data, duration);

    if (!response.ok) {
      // Global de-auth on 401 (disabled/invalid session). The backend now
      // re-checks `active` per request, so a disabled user's JWT yields 401 on
      // any protected endpoint. We CLEAR THE STALE SESSION ONLY here.
      //
      // Redirect is intentionally NOT done in this interceptor: useRequireAuth
      // (the route-level guard) owns navigation. Having both would cause double
      // navigation — window.location.assign forces a full-page reload that fights
      // the client-side router.push the guard issues.
      //
      // Discriminator: skip the auth endpoints (path starts with /api/auth/).
      // Those legitimately 401 on bad credentials or a disabled re-login attempt;
      // blanket-handling them would wipe state on a wrong-password typo.
      if (response.status === 401 && !endpoint.startsWith('/api/auth/')) {
        // Funnel into the single reactive auth store: it clears the stale
        // session (user + JWT) AND notifies every subscribed useAuth instance so
        // the whole app de-auths consistently.
        authStore.deauth();
      }

      surfaceToast(data);
      throw new FoundationApiError(
        data.message || data.error || `HTTP error! status: ${response.status}`,
        response.status,
        data,
      );
    }

    surfaceToast(data);
    return data;
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Foundation API request failed', { error: errorMessage, duration });
    throw error;
  }
}
