import { getLogger } from '../utils/logging';
import { envConfig } from '../utils/env';

const logger = getLogger('api-client');

export const API_BASE_URL = envConfig.apiUrl;

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const startTime = Date.now();
  const url = `${API_BASE_URL}${endpoint}`;

  logger.logApiRequest(options.method || 'GET', url, options.body);

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    });

    const duration = Date.now() - startTime;
    const data = await response.json();

    logger.logApiResponse(response.status, data, duration);

    if (!response.ok) {
      throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('API request failed', { error: errorMessage, duration });
    throw error;
  }
}
