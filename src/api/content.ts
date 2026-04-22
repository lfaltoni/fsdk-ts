// Content Pipeline API — framework-agnostic, pure TypeScript async functions
// No React imports. Any JS/TS consumer can call these directly.

import type {
  PipelineRuleListResponse,
  PipelineRuleResponse,
  CreatePipelineRuleRequest,
  UpdatePipelineRuleRequest,
  TestPipelineRuleParams,
  TestPipelineRuleResponse,
  ContentStatsResponse,
  ContentSourcesResponse,
  ContentSendersResponse,
  ContentMessageResponse,
} from '../types/content';
import { getLogger } from '../utils/logging';
import { foundationRequest } from './foundation-client';

const logger = getLogger('content-api');

export const contentPipelineApi = {
  /**
   * List all pipeline rules. Admin only.
   */
  listRules: async (): Promise<PipelineRuleListResponse> => {
    logger.info('Listing pipeline rules');

    try {
      const response = await foundationRequest<PipelineRuleListResponse>(
        '/api/content/pipeline-rules',
      );
      logger.info('Pipeline rules listed', { count: response.data.length });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to list pipeline rules', { error: errorMessage });
      throw error;
    }
  },

  /**
   * Create a new pipeline rule. Admin only.
   */
  createRule: async (data: CreatePipelineRuleRequest): Promise<PipelineRuleResponse> => {
    logger.info('Creating pipeline rule', { type: data.rule_type, name: data.name });

    try {
      const response = await foundationRequest<PipelineRuleResponse>(
        '/api/content/pipeline-rules',
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
      );
      logger.info('Pipeline rule created', { ruleId: response.data.rule_id });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to create pipeline rule', { error: errorMessage });
      throw error;
    }
  },

  /**
   * Get a single pipeline rule by ID. Admin only.
   */
  getRule: async (ruleId: string): Promise<PipelineRuleResponse> => {
    logger.info('Fetching pipeline rule', { ruleId });

    try {
      const response = await foundationRequest<PipelineRuleResponse>(
        `/api/content/pipeline-rules/${encodeURIComponent(ruleId)}`,
      );
      logger.info('Pipeline rule fetched', { ruleId });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to fetch pipeline rule', { error: errorMessage, ruleId });
      throw error;
    }
  },

  /**
   * Update a pipeline rule. Admin only.
   */
  updateRule: async (ruleId: string, data: UpdatePipelineRuleRequest): Promise<PipelineRuleResponse> => {
    logger.info('Updating pipeline rule', { ruleId });

    try {
      const response = await foundationRequest<PipelineRuleResponse>(
        `/api/content/pipeline-rules/${encodeURIComponent(ruleId)}`,
        {
          method: 'PUT',
          body: JSON.stringify(data),
        },
      );
      logger.info('Pipeline rule updated', { ruleId });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to update pipeline rule', { error: errorMessage, ruleId });
      throw error;
    }
  },

  /**
   * Delete a pipeline rule. Admin only.
   */
  deleteRule: async (ruleId: string): Promise<ContentMessageResponse> => {
    logger.info('Deleting pipeline rule', { ruleId });

    try {
      const response = await foundationRequest<ContentMessageResponse>(
        `/api/content/pipeline-rules/${encodeURIComponent(ruleId)}`,
        { method: 'DELETE' },
      );
      logger.info('Pipeline rule deleted', { ruleId });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to delete pipeline rule', { error: errorMessage, ruleId });
      throw error;
    }
  },

  /**
   * Toggle a pipeline rule's enabled state. Admin only.
   */
  toggleRule: async (ruleId: string): Promise<PipelineRuleResponse> => {
    logger.info('Toggling pipeline rule', { ruleId });

    try {
      const response = await foundationRequest<PipelineRuleResponse>(
        `/api/content/pipeline-rules/${encodeURIComponent(ruleId)}/toggle`,
        { method: 'POST' },
      );
      logger.info('Pipeline rule toggled', { ruleId, enabled: response.data.enabled });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to toggle pipeline rule', { error: errorMessage, ruleId });
      throw error;
    }
  },

  /**
   * Dry-run: test pipeline rules against a message without persisting. Admin only.
   */
  testRules: async (params: TestPipelineRuleParams): Promise<TestPipelineRuleResponse> => {
    logger.info('Testing pipeline rules', { source: params.source });

    const query = new URLSearchParams();
    query.set('source', params.source);
    query.set('body', params.body);
    if (params.source_content_id) query.set('source_content_id', params.source_content_id);
    if (params.content_metadata) query.set('content_metadata', params.content_metadata);

    try {
      const response = await foundationRequest<TestPipelineRuleResponse>(
        `/api/content/pipeline-rules/test?${query.toString()}`,
      );
      logger.info('Pipeline rules tested', { wouldIngest: response.would_ingest, reason: response.reason });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to test pipeline rules', { error: errorMessage });
      throw error;
    }
  },

  /**
   * Get aggregate ingestion statistics. Admin only.
   */
  getStats: async (): Promise<ContentStatsResponse> => {
    logger.info('Fetching content stats');

    try {
      const response = await foundationRequest<ContentStatsResponse>(
        '/api/content/stats',
      );
      logger.info('Content stats fetched', { total: response.data.total });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to fetch content stats', { error: errorMessage });
      throw error;
    }
  },

  /**
   * List distinct content sources (for populating dropdowns). Admin only.
   */
  getSources: async (): Promise<ContentSourcesResponse> => {
    logger.info('Fetching content sources');

    try {
      const response = await foundationRequest<ContentSourcesResponse>(
        '/api/content/sources',
      );
      logger.info('Content sources fetched', { count: response.data.length });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to fetch content sources', { error: errorMessage });
      throw error;
    }
  },

  /**
   * List known senders from ingested content metadata. Admin only.
   * Optional source filter (e.g. 'whatsapp').
   */
  getSenders: async (source?: string): Promise<ContentSendersResponse> => {
    logger.info('Fetching known senders', { source });

    try {
      const url = source
        ? `/api/content/senders?source=${encodeURIComponent(source)}`
        : '/api/content/senders';
      const response = await foundationRequest<ContentSendersResponse>(url);
      logger.info('Known senders fetched', { count: response.data.length });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to fetch known senders', { error: errorMessage });
      throw error;
    }
  },
};
