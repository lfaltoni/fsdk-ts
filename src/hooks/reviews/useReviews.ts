import { useState, useEffect, useCallback } from 'react';
import { reviewsApi } from '../../api/reviews';
import type {
  Review,
  ReviewStatsResponse,
  ReviewListParams,
  CreateReviewRequest,
  UpdateReviewRequest,
} from '../../types/review';
import { getLogger } from '../../utils/logging';

const logger = getLogger('useReviews');

interface UseReviewsReturn {
  // Read state
  reviews: Review[];
  stats: ReviewStatsResponse | null;
  total: number;
  page: number;
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;

  // Pagination & filtering
  setPage: (page: number) => void;
  setSort: (sort: ReviewListParams['sort']) => void;
  setRatingFilter: (rating: number | undefined) => void;
  refetch: () => Promise<void>;

  // Write actions
  createReview: (data: CreateReviewRequest) => Promise<Review>;
  updateReview: (reviewId: string, data: UpdateReviewRequest) => Promise<Review>;
  deleteReview: (reviewId: string) => Promise<void>;
  toggleHelpful: (reviewId: string) => Promise<void>;
  flagReview: (reviewId: string) => Promise<void>;

  // Reply actions
  addReply: (reviewId: string, content: string) => Promise<void>;
  updateReply: (replyId: string, content: string) => Promise<void>;
  deleteReply: (replyId: string) => Promise<void>;

  // Misc
  isSubmitting: boolean;
  clearError: () => void;
}

/**
 * Hook for fetching and managing reviews for a target entity.
 * Handles listing, stats, CRUD, helpful votes, and replies.
 */
export const useReviews = (
  targetTable: string,
  targetId: string,
  perPage = 10,
): UseReviewsReturn => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStatsResponse | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<ReviewListParams['sort']>('newest');
  const [ratingFilter, setRatingFilter] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // ── Fetch reviews + stats ──────────────────────────────────

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [listRes, statsRes] = await Promise.all([
        reviewsApi.getReviews(targetTable, targetId, {
          sort,
          rating: ratingFilter,
          page,
          per_page: perPage,
        }),
        reviewsApi.getStats(targetTable, targetId),
      ]);

      setReviews(listRes.reviews);
      setTotal(listRes.total);
      setStats(statsRes);
      logger.info('Reviews loaded', { total: listRes.total, avg: statsRes.averageRating });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load reviews';
      setError(msg);
      logger.error('Reviews fetch failed', { error: msg });
    } finally {
      setIsLoading(false);
    }
  }, [targetTable, targetId, sort, ratingFilter, page, perPage]);

  useEffect(() => {
    if (targetTable && targetId) {
      fetchReviews();
    }
  }, [fetchReviews, targetTable, targetId]);

  // ── Write actions ──────────────────────────────────────────

  const createReview = useCallback(async (data: CreateReviewRequest): Promise<Review> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const review = await reviewsApi.createReview(targetTable, targetId, data);
      await fetchReviews(); // refresh list + stats
      return review;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create review';
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [targetTable, targetId, fetchReviews]);

  const updateReview = useCallback(async (reviewId: string, data: UpdateReviewRequest): Promise<Review> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const review = await reviewsApi.updateReview(reviewId, data);
      await fetchReviews();
      return review;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update review';
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchReviews]);

  const deleteReview = useCallback(async (reviewId: string): Promise<void> => {
    setIsSubmitting(true);
    setError(null);
    try {
      await reviewsApi.deleteReview(reviewId);
      await fetchReviews();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete review';
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchReviews]);

  const toggleHelpful = useCallback(async (reviewId: string): Promise<void> => {
    try {
      const res = await reviewsApi.toggleHelpful(reviewId);
      // Optimistic update — patch the review in state
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? { ...r, helpfulCount: res.helpfulCount, viewerVotedHelpful: res.voted }
            : r,
        ),
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to toggle helpful';
      setError(msg);
    }
  }, []);

  const flagReview = useCallback(async (reviewId: string): Promise<void> => {
    try {
      await reviewsApi.flagReview(reviewId);
      // Remove from local list
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setTotal((prev) => Math.max(0, prev - 1));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to flag review';
      setError(msg);
    }
  }, []);

  // ── Reply actions ──────────────────────────────────────────

  const addReply = useCallback(async (reviewId: string, content: string): Promise<void> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await reviewsApi.addReply(reviewId, content);
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, reply: res.reply } : r)),
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to add reply';
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const updateReply = useCallback(async (replyId: string, content: string): Promise<void> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await reviewsApi.updateReply(replyId, content);
      setReviews((prev) =>
        prev.map((r) =>
          r.reply?.id === replyId ? { ...r, reply: res.reply } : r,
        ),
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update reply';
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const deleteReply = useCallback(async (replyId: string): Promise<void> => {
    setIsSubmitting(true);
    setError(null);
    try {
      await reviewsApi.deleteReply(replyId);
      setReviews((prev) =>
        prev.map((r) => (r.reply?.id === replyId ? { ...r, reply: null } : r)),
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete reply';
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // ── Return ─────────────────────────────────────────────────

  const isEmpty = !isLoading && reviews.length === 0;

  return {
    reviews,
    stats,
    total,
    page,
    isLoading,
    error,
    isEmpty,
    setPage,
    setSort,
    setRatingFilter,
    refetch: fetchReviews,
    createReview,
    updateReview,
    deleteReview,
    toggleHelpful,
    flagReview,
    addReply,
    updateReply,
    deleteReply,
    isSubmitting,
    clearError,
  };
};
