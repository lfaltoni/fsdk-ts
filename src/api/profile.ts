import type { User } from '../types/auth';
import { getLogger } from '../utils/logging';
import { apiRequest } from './client';

const logger = getLogger('profile-api');

interface ProfileResponse {
  success: boolean;
  user?: User;
  profile_data?: Record<string, any>;
  error?: string;
}

export const profileApi = {
  getProfile: async (): Promise<{ user: User; profile_data: Record<string, any> }> => {
    logger.info('Fetching user profile');

    try {
      const response = await apiRequest<ProfileResponse>('/api/users/profile');

      if (!response.user) {
        throw new Error('Invalid response: user data missing');
      }

      logger.info('Profile fetched successfully');
      return {
        user: response.user,
        profile_data: response.profile_data || {}
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
      const response = await apiRequest<{ success: boolean; message: string }>('/api/users/profile', {
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
  }
};
