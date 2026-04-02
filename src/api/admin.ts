// Admin API — framework-agnostic, pure TypeScript async functions
// No React imports. Any JS/TS consumer can call these directly.

import type {
  AdminUserListResponse,
  AdminUserDetailResponse,
  AdminUserListParams,
  AdminMessageResponse,
} from '../types/admin';
import { getLogger } from '../utils/logging';
import { foundationRequest } from './foundation-client';

const logger = getLogger('admin-api');

export const adminApi = {
  /**
   * List users with optional search and pagination. Admin only.
   */
  listUsers: async (params: AdminUserListParams = {}): Promise<AdminUserListResponse> => {
    logger.info('Listing users', params);

    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.per_page) query.set('per_page', String(params.per_page));
    if (params.search) query.set('search', params.search);
    if (params.active !== undefined) query.set('active', String(params.active));

    const qs = query.toString();
    const url = `/api/admin/users/${qs ? `?${qs}` : ''}`;

    try {
      const response = await foundationRequest<AdminUserListResponse>(url);
      logger.info('Users listed', { total: response.meta.total });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to list users', { error: errorMessage });
      throw error;
    }
  },

  /**
   * Get user detail including MFA enrollment status. Admin only.
   */
  getUserDetail: async (userId: string): Promise<AdminUserDetailResponse> => {
    logger.info('Fetching user detail', { userId });

    try {
      const response = await foundationRequest<AdminUserDetailResponse>(
        `/api/admin/users/${encodeURIComponent(userId)}`,
      );
      logger.info('User detail fetched', { userId });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to fetch user detail', { error: errorMessage, userId });
      throw error;
    }
  },

  /**
   * Enable or disable a user account. Admin only.
   */
  setAccountStatus: async (userId: string, active: boolean): Promise<AdminMessageResponse> => {
    logger.info('Setting account status', { userId, active });

    try {
      const response = await foundationRequest<AdminMessageResponse>(
        `/api/admin/users/${encodeURIComponent(userId)}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ active }),
        },
      );
      logger.info('Account status updated', { userId, active });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to set account status', { error: errorMessage, userId });
      throw error;
    }
  },

  /**
   * Resend MFA verification email for a user. Admin only.
   */
  resendMfa: async (userId: string): Promise<AdminMessageResponse> => {
    logger.info('Resending MFA email', { userId });

    try {
      const response = await foundationRequest<AdminMessageResponse>(
        `/api/admin/users/${encodeURIComponent(userId)}/resend-mfa`,
        { method: 'POST' },
      );
      logger.info('MFA email resent', { userId });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to resend MFA email', { error: errorMessage, userId });
      throw error;
    }
  },
};
