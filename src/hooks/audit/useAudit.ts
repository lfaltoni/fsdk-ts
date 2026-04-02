import { useState, useCallback } from 'react';
import { auditApi } from '../../api/audit';
import type { AuditEntry, AuditPaginationMeta, AuditQueryParams } from '../../types/audit';
import { getLogger } from '../../utils/logging';

const logger = getLogger('useAudit');

interface UseAuditReturn {
  // State
  entries: AuditEntry[];
  meta: AuditPaginationMeta | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  query: (params?: AuditQueryParams) => Promise<void>;
  getActorTimeline: (actorType: string, actorId: string, page?: number) => Promise<void>;
  getEntityHistory: (entityType: string, entityId: string, page?: number) => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for querying audit logs.
 * No auto-fetch — admin triggers queries manually.
 */
export const useAudit = (): UseAuditReturn => {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [meta, setMeta] = useState<AuditPaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const query = useCallback(async (params: AuditQueryParams = {}): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await auditApi.query(params);
      setEntries(res.data);
      setMeta(res.meta);
      logger.info('Audit query complete', { total: res.meta.total });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to query audit log';
      setError(msg);
      logger.error('Audit query failed', { error: msg });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getActorTimeline = useCallback(async (
    actorType: string,
    actorId: string,
    page = 1,
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await auditApi.getActorTimeline(actorType, actorId, page);
      setEntries(res.data);
      setMeta(res.meta);
      logger.info('Actor timeline loaded', { actorType, actorId, total: res.meta.total });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch actor timeline';
      setError(msg);
      logger.error('Actor timeline failed', { error: msg });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getEntityHistory = useCallback(async (
    entityType: string,
    entityId: string,
    page = 1,
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await auditApi.getEntityHistory(entityType, entityId, page);
      setEntries(res.data);
      setMeta(res.meta);
      logger.info('Entity history loaded', { entityType, entityId, total: res.meta.total });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch entity history';
      setError(msg);
      logger.error('Entity history failed', { error: msg });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    entries,
    meta,
    isLoading,
    error,
    query,
    getActorTimeline,
    getEntityHistory,
    clearError,
  };
};
