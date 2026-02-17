// Review types — matches foundation-sdk reviews API response shapes

export interface ReviewReply {
  id: string;
  reviewId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  userId: string;
  targetTable: string;
  targetId: string;
  rating: number;
  title: string | null;
  content: string | null;
  verified: boolean;
  status: string;
  helpfulCount: number;
  reply: ReviewReply | null;
  createdAt: string;
  updatedAt: string;
  // Enriched by blueprint serializer
  authorName: string;
  authorAvatar: string | null;
  viewerVotedHelpful: boolean;
}

export interface ReviewListResponse {
  success: boolean;
  reviews: Review[];
  total: number;
  page: number;
  perPage: number;
}

export interface ReviewStatsResponse {
  success: boolean;
  averageRating: number;
  totalCount: number;
  breakdown: Record<string, number>; // { "1": 2, "2": 0, ... "5": 15 }
}

export interface HelpfulResponse {
  success: boolean;
  voted: boolean;
  helpfulCount: number;
}

export interface ReplyResponse {
  success: boolean;
  reply: ReviewReply;
}

export interface CreateReviewRequest {
  rating: number;
  title?: string;
  content?: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  title?: string | null;
  content?: string | null;
}

export interface ReviewListParams {
  sort?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
  rating?: number;
  page?: number;
  per_page?: number;
}
