import type { User, PublicProfile } from '../types/auth';
import { getLogger } from '../utils/logging';
import { FoundationApiError, foundationRequest } from './foundation-client';

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

  /**
   * Update the authenticated user's profile_data.
   *
   * The backend enforces the consumer-declared `PROFILE_DATA_ALLOWED_KEYS` plus
   * a reserved-name denylist and size bounds. A field it will not store is
   * **refused with 422**, not silently dropped, and the offending names come
   * back at `errors.rejected_keys` — read them off `FoundationApiError`:
   *
   * ```ts
   * try { await profileApi.updateProfile(data) }
   * catch (e) {
   *   if (e instanceof FoundationApiError && e.status === 422) {
   *     showFieldErrors(e.rejectedKeys)
   *   }
   * }
   * ```
   */
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
      const rejectedKeys =
        error instanceof FoundationApiError ? error.rejectedKeys : [];
      logger.error('Profile update failed', { error: errorMessage, rejectedKeys });
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
