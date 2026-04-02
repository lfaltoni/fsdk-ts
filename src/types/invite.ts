// Invite types — matches foundation-sdk invites API response shapes (snake_case keys)

export interface PlatformInvite {
  id: string;
  token: string;
  email: string | null;
  created_by: string | null;
  status: string;
  invite_metadata: Record<string, unknown> | null;
  expires_at: string | null;
  used_at: string | null;
  used_by: string | null;
  created_at: string;
  revoked_at: string | null;
}

export interface InvitePaginationMeta {
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface InviteListResponse {
  success: boolean;
  data: PlatformInvite[];
  meta: InvitePaginationMeta;
}

export interface InviteValidateResponse {
  success: boolean;
  valid: boolean;
  invite: PlatformInvite | null;
}

export interface InviteCreateRequest {
  email?: string;
  expires_hours?: number;
  metadata?: Record<string, unknown>;
}

export interface MessageResponse {
  success: boolean;
  message: string;
}
