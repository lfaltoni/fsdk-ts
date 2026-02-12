import { LoginCredentials, RegisterData, User } from '../types/auth';
import { getLogger } from '../utils/logging';
import { apiRequest } from './client';

const logger = getLogger('auth-api');

// Structured response from auth endpoints
interface AuthResponse<T = any> {
  success: boolean;
  message?: string;
  user?: T;
  error?: string;
}

// Authentication API functions
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<User> => {
    logger.info('Attempting login', { email: credentials.email });

    try {
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

  register: async (userData: RegisterData): Promise<User> => {
    logger.info('Attempting registration', { email: userData.email });

    try {
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
  }
};
