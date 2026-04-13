import { useState, useCallback } from 'react';
import { mediaApi } from '../../api/media';
import type { MediaItem } from '../../types/media';
import { getLogger } from '../../utils/logging';

const logger = getLogger('useMedia');

export interface UseMediaReturn {
  items: MediaItem[];
  isLoading: boolean;
  error: string | null;
  upload: (file: File, associationType?: string) => Promise<void>;
  remove: (mediaId: number) => Promise<void>;
  reorder: (orderedIds: number[]) => Promise<void>;
  setPrimary: (mediaId: number) => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
}

export const useMedia = (entityType: string, entityId: string): UseMediaReturn => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGallery = useCallback(async () => {
    if (!entityType || !entityId) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await mediaApi.getGallery(entityType, entityId);
      setItems(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load media';
      logger.error('Failed to load gallery', { entityType, entityId, error: message });
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [entityType, entityId]);

  const upload = useCallback(async (file: File, associationType: string = 'gallery') => {
    try {
      setError(null);
      logger.info('Uploading media', { entityType, entityId, associationType, filename: file.name });
      await mediaApi.uploadMedia(entityType, entityId, file, associationType);
      await loadGallery();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload media';
      logger.error('Upload failed', { error: message });
      setError(message);
      throw err;
    }
  }, [entityType, entityId, loadGallery]);

  const remove = useCallback(async (mediaId: number) => {
    try {
      setError(null);
      logger.info('Deleting media', { mediaId });
      await mediaApi.deleteMedia(mediaId);
      setItems(prev => prev.filter(item => item.id !== mediaId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete media';
      logger.error('Delete failed', { error: message });
      setError(message);
      throw err;
    }
  }, []);

  const reorder = useCallback(async (orderedIds: number[]) => {
    try {
      setError(null);
      await mediaApi.reorderMedia(entityType, entityId, orderedIds);
      await loadGallery();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reorder media';
      logger.error('Reorder failed', { error: message });
      setError(message);
      throw err;
    }
  }, [entityType, entityId, loadGallery]);

  const setPrimary = useCallback(async (mediaId: number) => {
    try {
      setError(null);
      logger.info('Setting primary media', { mediaId });
      await mediaApi.setPrimary(mediaId);
      setItems(prev => prev.map(item => ({
        ...item,
        is_primary: item.id === mediaId,
      })));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to set primary media';
      logger.error('Set primary failed', { error: message });
      setError(message);
      throw err;
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    items,
    isLoading,
    error,
    upload,
    remove,
    reorder,
    setPrimary,
    refresh: loadGallery,
    clearError,
  };
};
