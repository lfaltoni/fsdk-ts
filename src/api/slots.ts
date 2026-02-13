import type { ExperienceSlot } from '../types/slot';
import { getLogger } from '../utils/logging';
import { apiRequest } from './client';

const logger = getLogger('slots-api');

export const slotsApi = {
  getSlotsByExperienceHandle: async (handle: string): Promise<ExperienceSlot[]> => {
    logger.info('Fetching slots for experience', { handle });

    try {
      const response = await apiRequest<ExperienceSlot[]>(
        `/api/v1/experiences/${encodeURIComponent(handle)}/slots`,
        { credentials: 'omit' },
      );
      logger.info('Slots fetched successfully', { handle, count: response.length });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to fetch slots', { error: errorMessage, handle });
      throw error;
    }
  },
};
