// Audit types — matches foundation-sdk audit API response shapes (snake_case keys)

export interface AuditEntry {
  entry_id: string;
  actor_type: string;
  actor_id: string | null;
  actor_label: string | null;
  action: string;
  category: string | null;
  entity_type: string | null;
  entity_id: string | null;
  entity_label: string | null;
  app_id: string;
  ip_address: string | null;
  user_agent: string | null;
  extra_data: Record<string, unknown> | null;
  created_at: string;
}

export interface AuditPaginationMeta {
  total: number;
  page: number;
  per_page: number;
  has_next: boolean;
}

export interface AuditPageResponse {
  success: boolean;
  data: AuditEntry[];
  meta: AuditPaginationMeta;
}

export interface AuditQueryParams {
  actor_type?: string;
  actor_id?: string;
  action?: string;
  action_prefix?: string;
  category?: string;
  entity_type?: string;
  entity_id?: string;
  since?: string;
  until?: string;
  page?: number;
  per_page?: number;
}
