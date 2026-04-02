import { useState, useEffect, useCallback } from 'react';
import { mfaApi } from '../../api/mfa';
import type { MfaResultResponse } from '../../types/mfa';
import { getLogger } from '../../utils/logging';

const logger = getLogger('useMfa');

interface UseMfaReturn {
  // State
  enrolled: boolean | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Enrollment actions
  beginEnrollment: (email: string) => Promise<MfaResultResponse>;
  confirmEnrollment: (code: string) => Promise<MfaResultResponse>;
  unenroll: () => Promise<MfaResultResponse>;

  // Challenge actions
  sendChallenge: () => Promise<MfaResultResponse>;
  verifyChallenge: (code: string) => Promise<MfaResultResponse>;

  // Misc
  refreshStatus: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for managing MFA enrollment and challenges.
 * Auto-fetches enrollment status on mount.
 */
export const useMfa = (): UseMfaReturn => {
  const [enrolled, setEnrolled] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // ── Fetch status ───────────────────────────────────────────

  const refreshStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await mfaApi.getStatus();
      setEnrolled(res.enrolled);
      logger.info('MFA status loaded', { enrolled: res.enrolled });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load MFA status';
      setError(msg);
      logger.error('MFA status fetch failed', { error: msg });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  // ── Enrollment actions ─────────────────────────────────────

  const beginEnrollment = useCallback(async (email: string): Promise<MfaResultResponse> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await mfaApi.beginEnrollment(email);
      return res;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to begin MFA enrollment';
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const confirmEnrollment = useCallback(async (code: string): Promise<MfaResultResponse> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await mfaApi.confirmEnrollment(code);
      setEnrolled(true);
      return res;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to confirm MFA enrollment';
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const unenroll = useCallback(async (): Promise<MfaResultResponse> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await mfaApi.unenroll();
      setEnrolled(false);
      return res;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to unenroll from MFA';
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // ── Challenge actions ──────────────────────────────────────

  const sendChallenge = useCallback(async (): Promise<MfaResultResponse> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await mfaApi.sendChallenge();
      return res;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to send MFA challenge';
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const verifyChallenge = useCallback(async (code: string): Promise<MfaResultResponse> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await mfaApi.verifyChallenge(code);
      return res;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to verify MFA challenge';
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    enrolled,
    isLoading,
    isSubmitting,
    error,
    beginEnrollment,
    confirmEnrollment,
    unenroll,
    sendChallenge,
    verifyChallenge,
    refreshStatus,
    clearError,
  };
};
