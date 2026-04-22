// Content pipeline types — matches foundation-sdk content admin API response shapes

export type PipelineRuleType = 'dedup_strategy' | 'keyword_block' | 'frequency_cap' | 'sender_block' | 'sender_allow';
export type DedupMethod = 'source_content_id' | 'content_hash' | 'both';
export type RuleAction = 'skip' | 'flag';
export type FrequencyCapScope = 'global' | 'channel' | 'sender' | 'sender_channel';

export interface ContentPipelineRule {
  rule_id: string;
  rule_type: PipelineRuleType;
  source: string | null;
  name: string;
  description: string | null;
  config: Record<string, unknown>;
  enabled: boolean;
  priority: number;
  created_at: string;
}

export interface CreatePipelineRuleRequest {
  rule_type: PipelineRuleType;
  name: string;
  config: Record<string, unknown>;
  source?: string | null;
  description?: string;
  enabled?: boolean;
  priority?: number;
}

export interface UpdatePipelineRuleRequest {
  name?: string;
  config?: Record<string, unknown>;
  source?: string | null;
  description?: string | null;
  enabled?: boolean;
  priority?: number;
}

export interface PipelineRuleResponse {
  success: boolean;
  data: ContentPipelineRule;
}

export interface PipelineRuleListResponse {
  success: boolean;
  data: ContentPipelineRule[];
}

export interface TestPipelineRuleParams {
  source: string;
  body: string;
  source_content_id?: string;
  content_metadata?: string;
}

export interface TestPipelineRuleResponse {
  success: boolean;
  would_ingest: boolean;
  reason: string;
  rule_name: string | null;
}

export interface ContentStats {
  total: number;
  by_source: Record<string, number>;
  by_status: Record<string, number>;
}

export interface ContentStatsResponse {
  success: boolean;
  data: ContentStats;
}

export interface ContentSourcesResponse {
  success: boolean;
  data: string[];
}

export interface KnownSender {
  sender_id: string;
  sender_name: string;
}

export interface ContentSendersResponse {
  success: boolean;
  data: KnownSender[];
}

export interface ContentMessageResponse {
  success: boolean;
  message: string;
}
