import { useState, useEffect, useCallback } from 'react';
import { authApi } from '../../api/auth';
import { storage } from '../../utils/storage';
import type { LoginCredentials, RegisterData, AuthResponse, User } from '../../types/auth';
import { getLogger } from '../../utils/logging';

const logger = getLogger('useLogin');

interface UseLoginReturn {
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (userData: RegisterData) => Promise<User>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Hook for handling login and registration functionality
 */
export const useLogin = (): UseLoginReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<User> => {
    setIsLoading(true);
    setError(null);
    
    try {
      logger.info('Starting login process');
      logger.logFormSubmission(credentials);

      const user = await authApi.login(credentials);
      
      // Store user session
      storage.setUser(user);
      logger.info('Login successful', { userId: user.user_id });
      
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      logger.error('Login error', { error: errorMessage });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (userData: RegisterData): Promise<User> => {
    setIsLoading(true);
    setError(null);
    
    try {
      logger.info('Starting registration process');
      logger.logFormSubmission(userData);

      const user = await authApi.register(userData);
      
      // Store user session
      storage.setUser(user);
      logger.info('Registration successful', { userId: user.user_id });
      
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
      logger.error('Registration error', { error: errorMessage });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    login,
    register,
    isLoading,
    error,
    clearError
  };
};
