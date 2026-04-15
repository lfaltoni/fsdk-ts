// Phone Verification API — framework-agnostic, pure TypeScript async functions
// No React imports. Any JS/TS consumer can call these directly.

import type {
  SendCodeRequest,
  SendCodeResponse,
  VerifyCodeRequest,
  VerifyCodeResponse,
  PhoneVerificationStatus,
} from '../types/phoneVerification';
import { getLogger } from '../utils/logging';
import { foundationRequest } from './foundation-client';

const logger = getLogger('phone-verification-api');

export const phoneVerificationApi = {
  /**
   * Send a verification code to a phone number. Auth required.
   */
  sendCode: async (phoneNumber: string): Promise<SendCodeResponse> => {
    logger.info('Sending verification code', { phoneNumber });

    try {
      const response = await foundationRequest<SendCodeResponse>(
        '/api/phone-verification/send',
        {
          method: 'POST',
          body: JSON.stringify({ phone_number: phoneNumber } satisfies SendCodeRequest),
        },
      );
      logger.info('Verification code sent', { verificationId: response.verification_id });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to send verification code', { error: errorMessage });
      throw error;
    }
  },

  /**
   * Verify a code and link the phone number to the current user. Auth required.
   */
  verifyCode: async (
    verificationId: string,
    code: string,
  ): Promise<VerifyCodeResponse> => {
    logger.info('Verifying code', { verificationId });

    try {
      const response = await foundationRequest<VerifyCodeResponse>(
        '/api/phone-verification/verify',
        {
          method: 'POST',
          body: JSON.stringify({
            verification_id: verificationId,
            code,
          } satisfies VerifyCodeRequest),
        },
      );
      logger.info('Code verification result', { verificationId, verified: response.verified });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to verify code', { error: errorMessage, verificationId });
      throw error;
    }
  },

  /**
   * Check if the current user has a verified phone number. Auth required.
   */
  getStatus: async (): Promise<PhoneVerificationStatus> => {
    logger.info('Checking phone verification status');

    try {
      const response = await foundationRequest<PhoneVerificationStatus>(
        '/api/phone-verification/status',
      );
      logger.info('Phone verification status', { isVerified: response.is_verified });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to check phone verification status', { error: errorMessage });
      throw error;
    }
  },
};
