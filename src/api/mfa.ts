// MFA API — framework-agnostic, pure TypeScript async functions
// No React imports. Any JS/TS consumer can call these directly.

import type {
  MfaStatusResponse,
  MfaResultResponse,
} from '../types/mfa';
import { getLogger } from '../utils/logging';
import { foundationRequest } from './foundation-client';

const logger = getLogger('mfa-api');

export const mfaApi = {
  /**
   * Get current user's MFA enrollment status.
   */
  getStatus: async (): Promise<MfaStatusResponse> => {
    logger.info('Fetching MFA status');

    try {
      const response = await foundationRequest<MfaStatusResponse>('/api/mfa/status');
      logger.info('MFA status fetched', { enrolled: response.enrolled });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to fetch MFA status', { error: errorMessage });
      throw error;
    }
  },

  /**
   * Begin MFA enrollment. Triggers a verification email.
   */
  beginEnrollment: async (email: string): Promise<MfaResultResponse> => {
    logger.info('Beginning MFA enrollment', { email });

    try {
      const response = await foundationRequest<MfaResultResponse>('/api/mfa/enroll', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      logger.info('MFA enrollment started', { success: response.success });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to begin MFA enrollment', { error: errorMessage });
      throw error;
    }
  },

  /**
   * Confirm MFA enrollment with a verification code.
   */
  confirmEnrollment: async (code: string): Promise<MfaResultResponse> => {
    logger.info('Confirming MFA enrollment');

    try {
      const response = await foundationRequest<MfaResultResponse>('/api/mfa/enroll/confirm', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
      logger.info('MFA enrollment confirmed', { success: response.success });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to confirm MFA enrollment', { error: errorMessage });
      throw error;
    }
  },

  /**
   * Unenroll from MFA.
   */
  unenroll: async (): Promise<MfaResultResponse> => {
    logger.info('Unenrolling from MFA');

    try {
      const response = await foundationRequest<MfaResultResponse>('/api/mfa/enroll', {
        method: 'DELETE',
      });
      logger.info('MFA unenrolled', { success: response.success });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to unenroll from MFA', { error: errorMessage });
      throw error;
    }
  },

  /**
   * Send an MFA challenge code to the user's email.
   */
  sendChallenge: async (): Promise<MfaResultResponse> => {
    logger.info('Sending MFA challenge');

    try {
      const response = await foundationRequest<MfaResultResponse>('/api/mfa/challenge', {
        method: 'POST',
      });
      logger.info('MFA challenge sent', { success: response.success });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to send MFA challenge', { error: errorMessage });
      throw error;
    }
  },

  /**
   * Verify an MFA challenge code.
   */
  verifyChallenge: async (code: string): Promise<MfaResultResponse> => {
    logger.info('Verifying MFA challenge');

    try {
      const response = await foundationRequest<MfaResultResponse>('/api/mfa/challenge/verify', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
      logger.info('MFA challenge verified', { success: response.success });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to verify MFA challenge', { error: errorMessage });
      throw error;
    }
  },
};
