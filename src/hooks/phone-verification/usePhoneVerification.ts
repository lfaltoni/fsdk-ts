import { useState, useCallback } from 'react';
import { phoneVerificationApi } from '../../api/phoneVerification';
import type {
  SendCodeResponse,
  VerifyCodeResponse,
  PhoneVerificationStatus,
} from '../../types/phoneVerification';
import { getLogger } from '../../utils/logging';

const logger = getLogger('usePhoneVerification');

export interface UsePhoneVerificationReturn {
  // State
  isVerified: boolean;
  verifiedPhone: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  sendCode: (phoneNumber: string) => Promise<SendCodeResponse>;
  verifyCode: (verificationId: string, code: string) => Promise<VerifyCodeResponse>;
  checkStatus: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for phone number verification via SMS OTP.
 * Provides state and actions for the full verification flow:
 * send code → verify code → check status.
 */
export const usePhoneVerification = (): UsePhoneVerificationReturn => {
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const sendCode = useCallback(async (phoneNumber: string): Promise<SendCodeResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await phoneVerificationApi.sendCode(phoneNumber);
      logger.info('Code sent', { verificationId: response.verification_id });
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send code';
      setError(message);
      logger.error('Send code failed', { error: message });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyCode = useCallback(async (
    verificationId: string,
    code: string,
  ): Promise<VerifyCodeResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await phoneVerificationApi.verifyCode(verificationId, code);
      if (response.verified && response.phone_number) {
        setIsVerified(true);
        setVerifiedPhone(response.phone_number);
      }
      logger.info('Code verified', { verificationId, verified: response.verified });
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to verify code';
      setError(message);
      logger.error('Verify code failed', { error: message });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkStatus = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const status: PhoneVerificationStatus = await phoneVerificationApi.getStatus();
      setIsVerified(status.is_verified);
      setVerifiedPhone(status.verified_phone);
      logger.info('Status checked', { isVerified: status.is_verified });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to check status';
      setError(message);
      logger.error('Check status failed', { error: message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isVerified,
    verifiedPhone,
    isLoading,
    error,
    sendCode,
    verifyCode,
    checkStatus,
    clearError,
  };
};
