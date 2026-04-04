// Favorites API — framework-agnostic, pure TypeScript async functions

import type {
  ToggleFavoriteResponse,
  CheckFavoriteResponse,
  BulkCheckResponse,
  FavoriteListResponse,
  FavoriteCountResponse,
  FavoriteListParams,
} from '../types/favorites';
import { getLogger } from '../utils/logging';
import { foundationRequest } from './foundation-client';

const logger = getLogger('favorites-api');

export const favoritesApi = {
  /**
   * Toggle favorite on/off for an entity. Auth required.
   */
  toggle: async (
    targetTable: string,
    targetId: string,
  ): Promise<ToggleFavoriteResponse> => {
    logger.info('Toggling favorite', { targetTable, targetId });
    try {
      const response = await foundationRequest<ToggleFavoriteResponse>(
        `/api/favorites/${encodeURIComponent(targetTable)}/${encodeURIComponent(targetId)}/toggle`,
        { method: 'POST' },
      );
      logger.info('Favorite toggled', { targetTable, targetId, is_favorited: response.is_favorited });
      return response;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to toggle favorite', { error: msg, targetTable, targetId });
      throw error;
    }
  },

  /**
   * Check if the current user has favorited a specific entity. Auth required.
   */
  check: async (
    targetTable: string,
    targetId: string,
  ): Promise<CheckFavoriteResponse> => {
    try {
      return await foundationRequest<CheckFavoriteResponse>(
        `/api/favorites/${encodeURIComponent(targetTable)}/${encodeURIComponent(targetId)}/check`,
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to check favorite', { error: msg, targetTable, targetId });
      throw error;
    }
  },

  /**
   * Get all target_ids the current user has favorited for a given type.
   * Used on list pages to show which items are favorited (e.g. heart icons).
   */
  getFavoritedIds: async (targetTable: string): Promise<BulkCheckResponse> => {
    logger.info('Fetching favorited IDs', { targetTable });
    try {
      return await foundationRequest<BulkCheckResponse>(
        `/api/favorites/${encodeURIComponent(targetTable)}/ids`,
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to fetch favorited IDs', { error: msg, targetTable });
      throw error;
    }
  },

  /**
   * List the current user's favorites, optionally filtered by type. Auth required.
   */
  list: async (params: FavoriteListParams = {}): Promise<FavoriteListResponse> => {
    const query = new URLSearchParams();
    if (params.target_table) query.set('target_table', params.target_table);
    if (params.page) query.set('page', String(params.page));
    if (params.per_page) query.set('per_page', String(params.per_page));

    const qs = query.toString();
    const url = `/api/favorites/${qs ? `?${qs}` : ''}`;

    try {
      return await foundationRequest<FavoriteListResponse>(url);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to list favorites', { error: msg });
      throw error;
    }
  },

  /**
   * Get how many users have favorited a specific entity. Public.
   */
  getCount: async (targetTable: string, targetId: string): Promise<FavoriteCountResponse> => {
    try {
      return await foundationRequest<FavoriteCountResponse>(
        `/api/favorites/${encodeURIComponent(targetTable)}/${encodeURIComponent(targetId)}/count`,
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to get favorite count', { error: msg, targetTable, targetId });
      throw error;
    }
  },
};
