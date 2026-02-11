import { LoginCredentials, RegisterData, User } from '../types/auth';
import { getLogger } from '../utils/logging';
import { envConfig } from '../utils/env';

const logger = getLogger('auth-api');

// Base API configuration
const API_BASE_URL = envConfig.apiUrl;

// Structured response from NEW auth endpoints
interface AuthResponse<T = any> {
  success: boolean;
  message?: string;
  user?: T;
  error?: string;
}

// Generic API request wrapper
async function apiRequest<T>(
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
      // Handle structured error response from NEW endpoints
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

// Authentication API functions
export const authApi = {
  /**
   * Authenticate user with email and password
   */
  login: async (credentials: LoginCredentials): Promise<User> => {
    logger.info('Attempting login', { email: credentials.email });

    try {
      // NEW endpoint returns structured response: {success, message, user}
      const response = await apiRequest<AuthResponse<User>>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (!response.user) {
        throw new Error('Invalid response: user data missing');
      }

      logger.info('Login successful', { userId: response.user.user_id });
      return response.user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Login failed', { error: errorMessage });
      throw error;
    }
  },

  /**
   * Register a new user account
   */
  register: async (userData: RegisterData): Promise<User> => {
    logger.info('Attempting registration', { email: userData.email });

    try {
      // NEW endpoint returns structured response: {success, message, user}
      const response = await apiRequest<AuthResponse<User>>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      if (!response.user) {
        throw new Error('Invalid response: user data missing');
      }

      logger.info('Registration successful', { userId: response.user.user_id });
      return response.user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Registration failed', { error: errorMessage });
      throw error;
    }
  },

  /**
   * Logout current user
   */
  logout: async (): Promise<{ success: boolean; message: string }> => {
    logger.info('Attempting logout');
    
    try {
      const response = await apiRequest<{ success: boolean; message: string }>('/api/auth/logout', {
        method: 'POST',
      });

      logger.info('Logout successful');
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Logout failed', { error: errorMessage });
      throw error;
    }
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<User> => {
    logger.info('Fetching user profile');

    try {
      // NEW endpoint returns structured response: {success, user}
      const response = await apiRequest<AuthResponse<User>>('/api/auth/profile');

      if (!response.user) {
        throw new Error('Invalid response: user data missing');
      }

      logger.info('Profile fetched successfully');
      return response.user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to fetch profile', { error: errorMessage });
      throw error;
    }
  }
};
