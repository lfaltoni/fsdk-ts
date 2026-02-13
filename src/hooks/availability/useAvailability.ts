import { useState, useEffect, useCallback, useMemo } from 'react';
import { slotsApi } from '../../api/slots';
import type { ExperienceSlot } from '../../types/slot';
import { getLogger } from '../../utils/logging';

const logger = getLogger('useAvailability');

interface UseAvailabilityReturn {
  slots: ExperienceSlot[];
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
  availableDates: Set<string>;
  getSlotsByDate: (date: string) => ExperienceSlot[];
  refetch: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for fetching and managing experience slot availability.
 * Reusable across any site that queries Bookease-Pro slots.
 */
export const useAvailability = (handle: string): UseAvailabilityReturn => {
  const [slots, setSlots] = useState<ExperienceSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchSlots = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      logger.info('Fetching availability', { handle });
      const data = await slotsApi.getSlotsByExperienceHandle(handle);
      setSlots(data);
      logger.info('Availability fetched', { handle, count: data.length });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load availability';
      setError(errorMessage);
      logger.error('Availability fetch failed', { error: errorMessage, handle });
    } finally {
      setIsLoading(false);
    }
  }, [handle]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const availableDates = useMemo(
    () => new Set(slots.map((s) => s.date)),
    [slots],
  );

  const getSlotsByDate = useCallback(
    (date: string): ExperienceSlot[] => slots.filter((s) => s.date === date),
    [slots],
  );

  const isEmpty = !isLoading && slots.length === 0;

  return {
    slots,
    isLoading,
    error,
    isEmpty,
    availableDates,
    getSlotsByDate,
    refetch: fetchSlots,
    clearError,
  };
};
