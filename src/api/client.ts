import { getLogger } from '../utils/logging';
import { envConfig } from '../utils/env';

const logger = getLogger('api-client');

export const API_BASE_URL = envConfig.apiUrl;

// ---------------------------------------------------------------------------
// CSRF token management
// ---------------------------------------------------------------------------
// The backend uses Flask-WTF CSRF protection with session cookies.
// For cross-origin SPA requests, we fetch the token from a dedicated
// endpoint and include it in the X-CSRFToken header on mutating requests.
// The token is session-bound, so we cache it in memory and only re-fetch
// if the server rejects it (e.g. after session expiry).
// ---------------------------------------------------------------------------

let _csrfToken: string | null = null;
let _csrfFetchPromise: Promise<string> | null = null;

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

async function fetchCsrfToken(): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/v1/csrf-token`, {
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch CSRF token: ${res.status}`);
  }
  const data = await res.json();
  return data.csrfToken;
}

async function getCsrfToken(): Promise<string> {
  if (_csrfToken) return _csrfToken;

  // Deduplicate concurrent fetches
  if (!_csrfFetchPromise) {
    _csrfFetchPromise = fetchCsrfToken().then((token) => {
      _csrfToken = token;
      _csrfFetchPromise = null;
      return token;
    }).catch((err) => {
      _csrfFetchPromise = null;
      throw err;
    });
  }
  return _csrfFetchPromise;
}

function invalidateCsrfToken(): void {
  _csrfToken = null;
  _csrfFetchPromise = null;
}

function isCsrfError(status: number, data: Record<string, unknown>): boolean {
  return status === 400 && String(data.type || '').includes('CSRF');
}

// ---------------------------------------------------------------------------
// Core API request
// ---------------------------------------------------------------------------

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const credentials = options.credentials ?? 'include';
  const needsCsrf = MUTATING_METHODS.has(method);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Attach CSRF token for mutating requests that send credentials
  if (needsCsrf && credentials === 'include') {
    headers['X-CSRFToken'] = await getCsrfToken();
  }

  const startTime = Date.now();
  const url = `${API_BASE_URL}${endpoint}`;

  logger.logApiRequest(method, url, options.body);

  const doFetch = async (): Promise<T> => {
    const response = await fetch(url, {
      ...options,
      method,
      headers,
      credentials,
    });

    const duration = Date.now() - startTime;
    const data = await response.json();

    logger.logApiResponse(response.status, data, duration);

    if (!response.ok) {
      // If CSRF token was rejected, refresh and retry once
      if (needsCsrf && isCsrfError(response.status, data)) {
        invalidateCsrfToken();
        headers['X-CSRFToken'] = await getCsrfToken();

        const retryResponse = await fetch(url, {
          ...options,
          method,
          headers,
          credentials,
        });
        const retryData = await retryResponse.json();

        if (!retryResponse.ok) {
          throw new Error(retryData.message || retryData.error || `HTTP error! status: ${retryResponse.status}`);
        }
        return retryData;
      }

      throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  };

  try {
    return await doFetch();
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('API request failed', { error: errorMessage, duration });
    throw error;
  }
}
