// Admin types — matches foundation-sdk admin session API response shapes (snake_case keys)

export interface AdminUser {
  user_id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  active: boolean;
  platform_role: string | null;
  registration_order: number;
  created_at: string;
  first_login_at: string | null;
  last_seen_at: string | null;
  confirmed_at: string | null;
}

export interface AdminUserDetail {
  user: AdminUser;
  mfa_enrolled: boolean;
}

export interface AdminPaginationMeta {
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface AdminUserListResponse {
  success: boolean;
  data: AdminUser[];
  meta: AdminPaginationMeta;
}

export interface AdminUserDetailResponse {
  success: boolean;
  data: AdminUserDetail;
}

export interface AdminUserListParams {
  page?: number;
  per_page?: number;
  search?: string;
  active?: boolean;
}

export interface AdminAccountStatusRequest {
  active: boolean;
}

export interface AdminMessageResponse {
  success: boolean;
  message: string;
}
