// Media types for foundation-sdk media API

export interface MediaItem {
  id: number;
  url: string;
  filename: string;
  entity_type: string;
  entity_id: string;
  association_type: string;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

export interface MediaUploadResponse {
  success: boolean;
  media_id: number;
  url: string;
  filename: string;
  message?: string;
}
