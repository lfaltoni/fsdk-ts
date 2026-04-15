import type { User, PublicProfile } from '../types/auth';
import { getLogger } from '../utils/logging';
import { foundationRequest } from './foundation-client';

const logger = getLogger('profile-api');

interface ProfileResponse {
  success: boolean;
  user?: User;
  profile_data?: Record<string, any>;
  slug?: string | null;
  error?: string;
}

export const profileApi = {
  getProfile: async (): Promise<{ user: User; profile_data: Record<string, any>; slug: string | null }> => {
    logger.info('Fetching user profile');

    try {
      const response = await foundationRequest<ProfileResponse>('/api/users/profile');

      if (!response.user) {
        throw new Error('Invalid response: user data missing');
      }

      logger.info('Profile fetched successfully');
      return {
        user: response.user,
        profile_data: response.profile_data || {},
        slug: response.slug ?? null,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to fetch profile', { error: errorMessage });
      throw error;
    }
  },

  updateProfile: async (profileData: Record<string, any>): Promise<{ success: boolean; message: string }> => {
    logger.info('Attempting to update profile');

    try {
      const response = await foundationRequest<{ success: boolean; message: string }>('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });

      logger.info('Profile updated successfully');
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Profile update failed', { error: errorMessage });
      throw error;
    }
  },

  getPublicProfile: async (slug: string): Promise<PublicProfile> => {
    logger.info('Fetching public profile by slug', { slug });

    try {
      const response = await foundationRequest<PublicProfile>(`/api/profile/${encodeURIComponent(slug)}`);
      logger.info('Public profile fetched successfully');
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to fetch public profile', { error: errorMessage });
      throw error;
    }
  },

  getPublicProfileById: async (userId: string): Promise<PublicProfile> => {
    logger.info('Fetching public profile by user ID', { userId });

    try {
      const response = await foundationRequest<PublicProfile>(`/api/profile/id/${encodeURIComponent(userId)}`);
      logger.info('Public profile fetched successfully');
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to fetch public profile by ID', { error: errorMessage });
      throw error;
    }
  },
};
