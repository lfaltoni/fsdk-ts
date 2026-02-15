import { LoginCredentials, RegisterData, User } from '../types/auth';
import { getLogger } from '../utils/logging';
import { foundationRequest } from './foundation-client';
import { storage } from '../utils/storage';

const logger = getLogger('auth-api');

// Structured response from auth endpoints
interface AuthResponse<T = unknown> {
  success: boolean;
  message?: string;
  user?: T;
  token?: string;
  error?: string;
}

// Authentication API functions
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<User> => {
    logger.info('Attempting login', { email: credentials.email });

    const response = await foundationRequest<AuthResponse<User>>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (!response.user) {
      throw new Error('Invalid response: user data missing');
    }

    // Store JWT for cross-service auth
    if (response.token) {
      storage.setToken(response.token);
    }

    logger.info('Login successful', { userId: response.user.user_id });
    return response.user;
  },

  register: async (userData: RegisterData): Promise<User> => {
    logger.info('Attempting registration', { email: userData.email });

    const response = await foundationRequest<AuthResponse<User>>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (!response.user) {
      throw new Error('Invalid response: user data missing');
    }

    // Store JWT for cross-service auth
    if (response.token) {
      storage.setToken(response.token);
    }

    logger.info('Registration successful', { userId: response.user.user_id });
    return response.user;
  },

  logout: async (): Promise<{ success: boolean; message: string }> => {
    logger.info('Attempting logout');

    const response = await foundationRequest<{ success: boolean; message: string }>('/api/auth/logout', {
      method: 'POST',
    });

    logger.info('Logout successful');
    return response;
  },
};
