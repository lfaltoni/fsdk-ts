import { useState, useCallback } from 'react';
import { authApi } from '../../api/auth';
import { getLogger } from '../../utils/logging';

const logger = getLogger('usePasswordReset');

interface UsePasswordResetReturn {
  requestReset: (email: string) => Promise<void>;
  confirmReset: (token: string, newPassword: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  success: boolean;
  clearError: () => void;
  clearSuccess: () => void;
}

/**
 * Hook for handling password reset flow (request + confirm)
 */
export const usePasswordReset = (): UsePasswordResetReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const clearError = useCallback(() => setError(null), []);
  const clearSuccess = useCallback(() => setSuccess(false), []);

  const requestReset = useCallback(async (email: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      logger.info('Requesting password reset');
      await authApi.requestPasswordReset(email);
      setSuccess(true);
      logger.info('Password reset email sent');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset email';
      setError(errorMessage);
      logger.error('Password reset request failed', { error: errorMessage });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const confirmReset = useCallback(async (token: string, newPassword: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      logger.info('Confirming password reset');
      await authApi.confirmPasswordReset(token, newPassword);
      setSuccess(true);
      logger.info('Password reset confirmed');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password';
      setError(errorMessage);
      logger.error('Password reset confirmation failed', { error: errorMessage });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    requestReset,
    confirmReset,
    isLoading,
    error,
    success,
    clearError,
    clearSuccess,
  };
};
