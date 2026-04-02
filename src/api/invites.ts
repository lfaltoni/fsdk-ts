// Invites API — framework-agnostic, pure TypeScript async functions
// No React imports. Any JS/TS consumer can call these directly.

import type {
  PlatformInvite,
  InviteListResponse,
  InviteValidateResponse,
  InviteCreateRequest,
  MessageResponse,
} from '../types/invite';
import { getLogger } from '../utils/logging';
import { foundationRequest } from './foundation-client';

const logger = getLogger('invites-api');

export const invitesApi = {
  // ---------------------------------------------------------------------------
  // Admin endpoints — /api/admin/invites/ (platform admin only)
  // ---------------------------------------------------------------------------

  /**
   * Create a new platform invite. Admin only.
   */
  create: async (data: InviteCreateRequest): Promise<PlatformInvite> => {
    logger.info('Creating invite', { email: data.email });

    try {
      const response = await foundationRequest<PlatformInvite>('/api/admin/invites/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      logger.info('Invite created', { id: response.id });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to create invite', { error: errorMessage });
      throw error;
    }
  },

  /**
   * List all invites (paginated). Admin only.
   */
  listAll: async (page = 1, perPage = 25): Promise<InviteListResponse> => {
    logger.info('Listing all invites', { page, perPage });

    const query = new URLSearchParams();
    query.set('page', String(page));
    query.set('per_page', String(perPage));

    try {
      const response = await foundationRequest<InviteListResponse>(
        `/api/admin/invites/?${query.toString()}`,
      );
      logger.info('Invites listed', { total: response.meta.total });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to list invites', { error: errorMessage });
      throw error;
    }
  },

  /**
   * List pending invites (paginated). Admin only.
   */
  listPending: async (page = 1, perPage = 25): Promise<InviteListResponse> => {
    logger.info('Listing pending invites', { page, perPage });

    const query = new URLSearchParams();
    query.set('page', String(page));
    query.set('per_page', String(perPage));

    try {
      const response = await foundationRequest<InviteListResponse>(
        `/api/admin/invites/pending?${query.toString()}`,
      );
      logger.info('Pending invites listed', { total: response.meta.total });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to list pending invites', { error: errorMessage });
      throw error;
    }
  },

  /**
   * Revoke a pending invite. Admin only.
   */
  revoke: async (inviteId: string): Promise<MessageResponse> => {
    logger.info('Revoking invite', { inviteId });

    try {
      const response = await foundationRequest<MessageResponse>(
        `/api/admin/invites/${encodeURIComponent(inviteId)}`,
        { method: 'DELETE' },
      );
      logger.info('Invite revoked', { inviteId });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to revoke invite', { error: errorMessage, inviteId });
      throw error;
    }
  },

  // ---------------------------------------------------------------------------
  // Token endpoints — /api/invites/ (login required, no admin)
  // ---------------------------------------------------------------------------

  /**
   * Validate an invite token. Returns validity and invite details.
   */
  validate: async (token: string): Promise<InviteValidateResponse> => {
    logger.info('Validating invite token');

    try {
      const response = await foundationRequest<InviteValidateResponse>(
        `/api/invites/validate/${encodeURIComponent(token)}`,
      );
      logger.info('Invite token validated', { valid: response.valid });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to validate invite token', { error: errorMessage });
      throw error;
    }
  },

  /**
   * Consume an invite token (mark as used by current user).
   */
  consume: async (token: string): Promise<MessageResponse> => {
    logger.info('Consuming invite token');

    try {
      const response = await foundationRequest<MessageResponse>(
        `/api/invites/consume/${encodeURIComponent(token)}`,
        { method: 'POST' },
      );
      logger.info('Invite token consumed');
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to consume invite token', { error: errorMessage });
      throw error;
    }
  },
};
