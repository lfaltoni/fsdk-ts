import { useState, useCallback } from 'react';
import { invitesApi } from '../../api/invites';
import type {
  PlatformInvite,
  InvitePaginationMeta,
  InviteCreateRequest,
  InviteValidateResponse,
  MessageResponse,
} from '../../types/invite';
import { getLogger } from '../../utils/logging';

const logger = getLogger('useInvites');

interface UseInvitesReturn {
  // State
  invites: PlatformInvite[];
  meta: InvitePaginationMeta | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Admin actions
  create: (data: InviteCreateRequest) => Promise<PlatformInvite>;
  listAll: (page?: number, perPage?: number) => Promise<void>;
  listPending: (page?: number, perPage?: number) => Promise<void>;
  revoke: (inviteId: string) => Promise<MessageResponse>;

  // Token actions
  validate: (token: string) => Promise<InviteValidateResponse>;
  consume: (token: string) => Promise<MessageResponse>;

  // Misc
  clearError: () => void;
}

/**
 * Hook for managing platform invites.
 * No auto-fetch — admin triggers listing manually.
 */
export const useInvites = (): UseInvitesReturn => {
  const [invites, setInvites] = useState<PlatformInvite[]>([]);
  const [meta, setMeta] = useState<InvitePaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // ── Admin actions ──────────────────────────────────────────

  const create = useCallback(async (data: InviteCreateRequest): Promise<PlatformInvite> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const invite = await invitesApi.create(data);
      logger.info('Invite created', { id: invite.id });
      return invite;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create invite';
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const listAll = useCallback(async (page = 1, perPage = 25): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await invitesApi.listAll(page, perPage);
      setInvites(res.data);
      setMeta(res.meta);
      logger.info('All invites listed', { total: res.meta.total });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to list invites';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const listPending = useCallback(async (page = 1, perPage = 25): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await invitesApi.listPending(page, perPage);
      setInvites(res.data);
      setMeta(res.meta);
      logger.info('Pending invites listed', { total: res.meta.total });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to list pending invites';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const revoke = useCallback(async (inviteId: string): Promise<MessageResponse> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await invitesApi.revoke(inviteId);
      // Remove from local list
      setInvites((prev) => prev.filter((i) => i.id !== inviteId));
      logger.info('Invite revoked', { inviteId });
      return res;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to revoke invite';
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // ── Token actions ──────────────────────────────────────────

  const validate = useCallback(async (token: string): Promise<InviteValidateResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await invitesApi.validate(token);
      logger.info('Invite validated', { valid: res.valid });
      return res;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to validate invite';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const consume = useCallback(async (token: string): Promise<MessageResponse> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await invitesApi.consume(token);
      logger.info('Invite consumed');
      return res;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to consume invite';
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    invites,
    meta,
    isLoading,
    isSubmitting,
    error,
    create,
    listAll,
    listPending,
    revoke,
    validate,
    consume,
    clearError,
  };
};
