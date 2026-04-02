// Audit API — framework-agnostic, pure TypeScript async functions
// No React imports. Any JS/TS consumer can call these directly.

import type {
  AuditPageResponse,
  AuditQueryParams,
} from '../types/audit';
import { getLogger } from '../utils/logging';
import { foundationRequest } from './foundation-client';

const logger = getLogger('audit-api');

export const auditApi = {
  /**
   * Query audit entries with flexible filters. Admin only.
   * Supports actor, action, category, entity, date range, and pagination.
   */
  query: async (params: AuditQueryParams = {}): Promise<AuditPageResponse> => {
    logger.info('Querying audit log', params);

    const query = new URLSearchParams();
    if (params.actor_type) query.set('actor_type', params.actor_type);
    if (params.actor_id) query.set('actor_id', params.actor_id);
    if (params.action) query.set('action', params.action);
    if (params.action_prefix) query.set('action_prefix', params.action_prefix);
    if (params.category) query.set('category', params.category);
    if (params.entity_type) query.set('entity_type', params.entity_type);
    if (params.entity_id) query.set('entity_id', params.entity_id);
    if (params.since) query.set('since', params.since);
    if (params.until) query.set('until', params.until);
    if (params.page) query.set('page', String(params.page));
    if (params.per_page) query.set('per_page', String(params.per_page));

    const qs = query.toString();
    const url = `/api/admin/audit/${qs ? `?${qs}` : ''}`;

    try {
      const response = await foundationRequest<AuditPageResponse>(url);
      logger.info('Audit query complete', { total: response.meta.total });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to query audit log', { error: errorMessage });
      throw error;
    }
  },

  /**
   * Get audit timeline for a specific actor. Admin only.
   */
  getActorTimeline: async (
    actorType: string,
    actorId: string,
    page = 1,
    perPage = 50,
  ): Promise<AuditPageResponse> => {
    logger.info('Fetching actor timeline', { actorType, actorId });

    const query = new URLSearchParams();
    query.set('page', String(page));
    query.set('per_page', String(perPage));

    const url = `/api/admin/audit/actor/${encodeURIComponent(actorType)}/${encodeURIComponent(actorId)}?${query.toString()}`;

    try {
      const response = await foundationRequest<AuditPageResponse>(url);
      logger.info('Actor timeline fetched', { actorType, actorId, total: response.meta.total });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to fetch actor timeline', { error: errorMessage, actorType, actorId });
      throw error;
    }
  },

  /**
   * Get audit history for a specific entity. Admin only.
   */
  getEntityHistory: async (
    entityType: string,
    entityId: string,
    page = 1,
    perPage = 50,
  ): Promise<AuditPageResponse> => {
    logger.info('Fetching entity history', { entityType, entityId });

    const query = new URLSearchParams();
    query.set('page', String(page));
    query.set('per_page', String(perPage));

    const url = `/api/admin/audit/entity/${encodeURIComponent(entityType)}/${encodeURIComponent(entityId)}?${query.toString()}`;

    try {
      const response = await foundationRequest<AuditPageResponse>(url);
      logger.info('Entity history fetched', { entityType, entityId, total: response.meta.total });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to fetch entity history', { error: errorMessage, entityType, entityId });
      throw error;
    }
  },
};
