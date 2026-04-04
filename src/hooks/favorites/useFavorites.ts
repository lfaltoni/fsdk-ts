import { useState, useEffect, useCallback } from 'react';
import { favoritesApi } from '../../api/favorites';
import type { FavoriteItem, FavoriteListParams } from '../../types/favorites';
import { getLogger } from '../../utils/logging';

const logger = getLogger('useFavorites');

interface UseFavoritesReturn {
  // State
  favorites: FavoriteItem[];
  favoritedIds: Set<string>;
  total: number;
  page: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  toggle: (targetTable: string, targetId: string) => Promise<boolean>;
  isFavorited: (targetId: string) => boolean;
  loadFavoritedIds: (targetTable: string) => Promise<void>;
  setPage: (page: number) => void;
  refetch: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for managing user favorites.
 *
 * Two modes:
 * 1. List mode: pass targetTable to load paginated favorites of that type
 * 2. Bulk check mode: call loadFavoritedIds(targetTable) to get all favorited IDs
 *    for use on list pages (e.g. highlight heart icons)
 */
export function useFavorites(params?: FavoriteListParams): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(params?.page ?? 1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const fetchFavorites = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await favoritesApi.list({
        target_table: params?.target_table,
        page,
        per_page: params?.per_page,
      });
      setFavorites(res.favorites);
      setTotal(res.total);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load favorites';
      logger.error('Failed to fetch favorites', { error: msg });
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [params?.target_table, params?.per_page, page]);

  const loadFavoritedIds = useCallback(async (targetTable: string) => {
    try {
      const res = await favoritesApi.getFavoritedIds(targetTable);
      setFavoritedIds(new Set(res.favorited_ids));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load favorited IDs';
      logger.error('Failed to load favorited IDs', { error: msg });
    }
  }, []);

  const toggle = useCallback(async (targetTable: string, targetId: string): Promise<boolean> => {
    try {
      const res = await favoritesApi.toggle(targetTable, targetId);
      // Update local state
      setFavoritedIds((prev) => {
        const next = new Set(prev);
        if (res.is_favorited) {
          next.add(targetId);
        } else {
          next.delete(targetId);
        }
        return next;
      });
      return res.is_favorited;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to toggle favorite';
      logger.error('Failed to toggle favorite', { error: msg });
      setError(msg);
      throw err;
    }
  }, []);

  const isFavorited = useCallback(
    (targetId: string) => favoritedIds.has(targetId),
    [favoritedIds],
  );

  useEffect(() => {
    if (params?.target_table) {
      fetchFavorites();
    }
  }, [fetchFavorites, params?.target_table]);

  return {
    favorites,
    favoritedIds,
    total,
    page,
    isLoading,
    error,
    toggle,
    isFavorited,
    loadFavoritedIds,
    setPage,
    refetch: fetchFavorites,
    clearError,
  };
}
