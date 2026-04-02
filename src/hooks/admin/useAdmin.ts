import { useState, useCallback } from 'react';
import { adminApi } from '../../api/admin';
import type {
  AdminUser,
  AdminUserDetail,
  AdminPaginationMeta,
  AdminUserListParams,
  AdminMessageResponse,
} from '../../types/admin';
import { getLogger } from '../../utils/logging';

const logger = getLogger('useAdmin');

interface UseAdminReturn {
  // State
  users: AdminUser[];
  meta: AdminPaginationMeta | null;
  selectedUser: AdminUserDetail | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Actions
  listUsers: (params?: AdminUserListParams) => Promise<void>;
  getUserDetail: (userId: string) => Promise<void>;
  setAccountStatus: (userId: string, active: boolean) => Promise<AdminMessageResponse>;
  resendMfa: (userId: string) => Promise<AdminMessageResponse>;
  clearError: () => void;
}

/**
 * Hook for admin user management.
 * No auto-fetch — admin triggers listing manually.
 */
export const useAdmin = (): UseAdminReturn => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState<AdminPaginationMeta | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const listUsers = useCallback(async (params: AdminUserListParams = {}): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await adminApi.listUsers(params);
      setUsers(res.data);
      setMeta(res.meta);
      logger.info('Users listed', { total: res.meta.total });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to list users';
      setError(msg);
      logger.error('User list failed', { error: msg });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserDetail = useCallback(async (userId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await adminApi.getUserDetail(userId);
      setSelectedUser(res.data);
      logger.info('User detail loaded', { userId });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch user detail';
      setError(msg);
      logger.error('User detail failed', { error: msg, userId });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setAccountStatus = useCallback(async (
    userId: string,
    active: boolean,
  ): Promise<AdminMessageResponse> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await adminApi.setAccountStatus(userId, active);
      // Optimistic update — patch user in local list
      setUsers((prev) =>
        prev.map((u) => (u.user_id === userId ? { ...u, active } : u)),
      );
      if (selectedUser && selectedUser.user.user_id === userId) {
        setSelectedUser({ ...selectedUser, user: { ...selectedUser.user, active } });
      }
      logger.info('Account status updated', { userId, active });
      return res;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update account status';
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedUser]);

  const resendMfa = useCallback(async (userId: string): Promise<AdminMessageResponse> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await adminApi.resendMfa(userId);
      logger.info('MFA email resent', { userId });
      return res;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to resend MFA email';
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    users,
    meta,
    selectedUser,
    isLoading,
    isSubmitting,
    error,
    listUsers,
    getUserDetail,
    setAccountStatus,
    resendMfa,
    clearError,
  };
};
