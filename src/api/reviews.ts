// Reviews API — framework-agnostic, pure TypeScript async functions
// No React imports. Any JS/TS consumer can call these directly.

import type {
  Review,
  ReviewListResponse,
  ReviewStatsResponse,
  HelpfulResponse,
  ReplyResponse,
  CreateReviewRequest,
  UpdateReviewRequest,
  ReviewListParams,
} from '../types/review';
import { getLogger } from '../utils/logging';
import { foundationRequest } from './foundation-client';

const logger = getLogger('reviews-api');

export const reviewsApi = {
  /**
   * List reviews for a target entity. Public — no auth required.
   * Supports sort, rating filter, and pagination via query params.
   */
  getReviews: async (
    targetTable: string,
    targetId: string,
    params: ReviewListParams = {},
  ): Promise<ReviewListResponse> => {
    logger.info('Fetching reviews', { targetTable, targetId, ...params });

    const query = new URLSearchParams();
    if (params.sort) query.set('sort', params.sort);
    if (params.rating) query.set('rating', String(params.rating));
    if (params.page) query.set('page', String(params.page));
    if (params.per_page) query.set('per_page', String(params.per_page));

    const qs = query.toString();
    const url = `/api/reviews/${encodeURIComponent(targetTable)}/${encodeURIComponent(targetId)}${qs ? `?${qs}` : ''}`;

    try {
      const response = await foundationRequest<ReviewListResponse>(url);
      logger.info('Reviews fetched', { targetTable, targetId, total: response.total });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to fetch reviews', { error: errorMessage, targetTable, targetId });
      throw error;
    }
  },

  /**
   * Get aggregate rating stats for a target entity. Public.
   * Returns average rating, total count, and per-star breakdown.
   */
  getStats: async (
    targetTable: string,
    targetId: string,
  ): Promise<ReviewStatsResponse> => {
    logger.info('Fetching review stats', { targetTable, targetId });

    try {
      const response = await foundationRequest<ReviewStatsResponse>(
        `/api/reviews/${encodeURIComponent(targetTable)}/${encodeURIComponent(targetId)}/stats`,
      );
      logger.info('Review stats fetched', { targetTable, targetId, avg: response.averageRating });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to fetch review stats', { error: errorMessage, targetTable, targetId });
      throw error;
    }
  },

  /**
   * Create a review for a target entity. Auth required.
   * One review per user per target.
   */
  createReview: async (
    targetTable: string,
    targetId: string,
    data: CreateReviewRequest,
  ): Promise<Review> => {
    logger.info('Creating review', { targetTable, targetId, rating: data.rating });

    try {
      const response = await foundationRequest<Review>(
        `/api/reviews/${encodeURIComponent(targetTable)}/${encodeURIComponent(targetId)}`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
      );
      logger.info('Review created', { reviewId: response.id });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to create review', { error: errorMessage, targetTable, targetId });
      throw error;
    }
  },

  /**
   * Update own review. Auth required.
   */
  updateReview: async (
    reviewId: string,
    data: UpdateReviewRequest,
  ): Promise<Review> => {
    logger.info('Updating review', { reviewId });

    try {
      const response = await foundationRequest<Review>(
        `/api/reviews/${encodeURIComponent(reviewId)}`,
        {
          method: 'PUT',
          body: JSON.stringify(data),
        },
      );
      logger.info('Review updated', { reviewId });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to update review', { error: errorMessage, reviewId });
      throw error;
    }
  },

  /**
   * Delete own review. Auth required.
   */
  deleteReview: async (reviewId: string): Promise<void> => {
    logger.info('Deleting review', { reviewId });

    try {
      await foundationRequest<{ success: boolean }>(
        `/api/reviews/${encodeURIComponent(reviewId)}`,
        { method: 'DELETE' },
      );
      logger.info('Review deleted', { reviewId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to delete review', { error: errorMessage, reviewId });
      throw error;
    }
  },

  /**
   * Toggle helpful vote on a review. Auth required.
   * Cannot vote on own review.
   */
  toggleHelpful: async (reviewId: string): Promise<HelpfulResponse> => {
    logger.info('Toggling helpful vote', { reviewId });

    try {
      const response = await foundationRequest<HelpfulResponse>(
        `/api/reviews/${encodeURIComponent(reviewId)}/helpful`,
        { method: 'POST' },
      );
      logger.info('Helpful toggled', { reviewId, voted: response.voted });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to toggle helpful', { error: errorMessage, reviewId });
      throw error;
    }
  },

  /**
   * Add owner/host reply to a review. One reply per review. Auth required.
   */
  addReply: async (reviewId: string, content: string): Promise<ReplyResponse> => {
    logger.info('Adding reply', { reviewId });

    try {
      const response = await foundationRequest<ReplyResponse>(
        `/api/reviews/${encodeURIComponent(reviewId)}/reply`,
        {
          method: 'POST',
          body: JSON.stringify({ content }),
        },
      );
      logger.info('Reply added', { reviewId, replyId: response.reply.id });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to add reply', { error: errorMessage, reviewId });
      throw error;
    }
  },

  /**
   * Update own reply. Auth required.
   */
  updateReply: async (replyId: string, content: string): Promise<ReplyResponse> => {
    logger.info('Updating reply', { replyId });

    try {
      const response = await foundationRequest<ReplyResponse>(
        `/api/reviews/replies/${encodeURIComponent(replyId)}`,
        {
          method: 'PUT',
          body: JSON.stringify({ content }),
        },
      );
      logger.info('Reply updated', { replyId });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to update reply', { error: errorMessage, replyId });
      throw error;
    }
  },

  /**
   * Delete own reply. Auth required.
   */
  deleteReply: async (replyId: string): Promise<void> => {
    logger.info('Deleting reply', { replyId });

    try {
      await foundationRequest<{ success: boolean }>(
        `/api/reviews/replies/${encodeURIComponent(replyId)}`,
        { method: 'DELETE' },
      );
      logger.info('Reply deleted', { replyId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to delete reply', { error: errorMessage, replyId });
      throw error;
    }
  },

  /**
   * Flag a review as inappropriate. Auth required.
   */
  flagReview: async (reviewId: string): Promise<void> => {
    logger.info('Flagging review', { reviewId });

    try {
      await foundationRequest<{ success: boolean }>(
        `/api/reviews/${encodeURIComponent(reviewId)}/flag`,
        { method: 'POST' },
      );
      logger.info('Review flagged', { reviewId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to flag review', { error: errorMessage, reviewId });
      throw error;
    }
  },
};
