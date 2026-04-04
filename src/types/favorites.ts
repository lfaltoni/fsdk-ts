// Favorites types — mirrors foundation-sdk favorites domain

export interface FavoriteItem {
  favorite_id: string;
  target_table: string;
  target_id: string;
  created_at: string;
}

export interface ToggleFavoriteResponse {
  success: boolean;
  is_favorited: boolean;
  favorite_id: string | null;
}

export interface CheckFavoriteResponse {
  success: boolean;
  is_favorited: boolean;
}

export interface BulkCheckResponse {
  success: boolean;
  favorited_ids: string[];
}

export interface FavoriteListResponse {
  success: boolean;
  favorites: FavoriteItem[];
  total: number;
  page: number;
  per_page: number;
}

export interface FavoriteCountResponse {
  success: boolean;
  count: number;
}

export interface FavoriteListParams {
  target_table?: string;
  page?: number;
  per_page?: number;
}
