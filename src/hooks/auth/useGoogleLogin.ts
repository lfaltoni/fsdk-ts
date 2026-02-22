import { useState, useCallback } from 'react';
import { authApi } from '../../api/auth';
import { useAuth } from './useAuth';
import type { User } from '../../types/auth';
import { getLogger } from '../../utils/logging';

const logger = getLogger('useGoogleLogin');

interface UseGoogleLoginReturn {
  googleLogin: (credential: string) => Promise<User>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Hook for handling Google Identity Services login.
 *
 * Usage:
 *   const { googleLogin, isLoading, error } = useGoogleLogin();
 *   // In GIS callback:
 *   const user = await googleLogin(response.credential);
 */
export const useGoogleLogin = (): UseGoogleLoginReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login: authLogin } = useAuth();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const googleLogin = useCallback(async (credential: string): Promise<User> => {
    setIsLoading(true);
    setError(null);

    try {
      logger.info('Starting Google login');
      const user = await authApi.googleLogin(credential);

      // Update React auth state
      authLogin(user);
      logger.info('Google login successful', { userId: user.user_id });

      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google sign-in failed';
      setError(errorMessage);
      logger.error('Google login error', { error: errorMessage });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [authLogin]);

  return {
    googleLogin,
    isLoading,
    error,
    clearError,
  };
};
