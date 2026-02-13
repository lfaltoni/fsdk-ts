import type { TExperienceListing, TExperienceListingDetail } from '../types/experience';
import { getLogger } from '../utils/logging';
import { apiRequest } from './client';

const logger = getLogger('experience-api');

export const experienceApi = {
  getExperiences: async (): Promise<TExperienceListing[]> => {
    logger.info('Fetching experience listings');

    try {
      const response = await apiRequest<TExperienceListing[]>('/api/v1/experiences');
      logger.info('Experience listings fetched successfully', { count: response.length });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to fetch experience listings', { error: errorMessage });
      throw error;
    }
  },

  getExperienceByHandle: async (handle: string): Promise<TExperienceListingDetail> => {
    logger.info('Fetching experience by handle', { handle });

    try {
      const response = await apiRequest<TExperienceListingDetail>(
        `/api/v1/experiences/${encodeURIComponent(handle)}`
      );
      logger.info('Experience fetched successfully', { handle });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to fetch experience', { error: errorMessage, handle });
      throw error;
    }
  },
};
