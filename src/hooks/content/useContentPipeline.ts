import { useState, useCallback } from 'react';
import { contentPipelineApi } from '../../api/content';
import type {
  ContentPipelineRule,
  ContentStats,
  KnownSender,
  CreatePipelineRuleRequest,
  UpdatePipelineRuleRequest,
  TestPipelineRuleParams,
  TestPipelineRuleResponse,
} from '../../types/content';
import { getLogger } from '../../utils/logging';

const logger = getLogger('useContentPipeline');

export interface UseContentPipelineReturn {
  // State
  rules: ContentPipelineRule[];
  selectedRule: ContentPipelineRule | null;
  stats: ContentStats | null;
  sources: string[];
  senders: KnownSender[];
  testResult: TestPipelineRuleResponse | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Actions
  listRules: () => Promise<void>;
  getRule: (ruleId: string) => Promise<void>;
  createRule: (data: CreatePipelineRuleRequest) => Promise<ContentPipelineRule>;
  updateRule: (ruleId: string, data: UpdatePipelineRuleRequest) => Promise<ContentPipelineRule>;
  deleteRule: (ruleId: string) => Promise<void>;
  toggleRule: (ruleId: string) => Promise<void>;
  testRules: (params: TestPipelineRuleParams) => Promise<void>;
  getStats: () => Promise<void>;
  getSources: () => Promise<void>;
  getSenders: (source?: string) => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for managing content pipeline rules.
 * No auto-fetch — admin triggers actions manually.
 */
export const useContentPipeline = (): UseContentPipelineReturn => {
  const [rules, setRules] = useState<ContentPipelineRule[]>([]);
  const [selectedRule, setSelectedRule] = useState<ContentPipelineRule | null>(null);
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [sources, setSources] = useState<string[]>([]);
  const [senders, setSenders] = useState<KnownSender[]>([]);
  const [testResult, setTestResult] = useState<TestPipelineRuleResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const listRules = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await contentPipelineApi.listRules();
      setRules(res.data);
      logger.info('Rules listed', { count: res.data.length });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to list rules';
      setError(msg);
      logger.error('Rules list failed', { error: msg });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getRule = useCallback(async (ruleId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await contentPipelineApi.getRule(ruleId);
      setSelectedRule(res.data);
      logger.info('Rule loaded', { ruleId });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch rule';
      setError(msg);
      logger.error('Rule fetch failed', { error: msg, ruleId });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createRule = useCallback(async (data: CreatePipelineRuleRequest): Promise<ContentPipelineRule> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await contentPipelineApi.createRule(data);
      setRules((prev) => [...prev, res.data].sort((a, b) => a.priority - b.priority));
      logger.info('Rule created', { ruleId: res.data.rule_id });
      return res.data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create rule';
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const updateRule = useCallback(async (ruleId: string, data: UpdatePipelineRuleRequest): Promise<ContentPipelineRule> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await contentPipelineApi.updateRule(ruleId, data);
      setRules((prev) =>
        prev.map((r) => (r.rule_id === ruleId ? res.data : r)).sort((a, b) => a.priority - b.priority),
      );
      if (selectedRule && selectedRule.rule_id === ruleId) {
        setSelectedRule(res.data);
      }
      logger.info('Rule updated', { ruleId });
      return res.data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update rule';
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedRule]);

  const deleteRule = useCallback(async (ruleId: string): Promise<void> => {
    setIsSubmitting(true);
    setError(null);

    try {
      await contentPipelineApi.deleteRule(ruleId);
      setRules((prev) => prev.filter((r) => r.rule_id !== ruleId));
      if (selectedRule && selectedRule.rule_id === ruleId) {
        setSelectedRule(null);
      }
      logger.info('Rule deleted', { ruleId });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete rule';
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedRule]);

  const toggleRule = useCallback(async (ruleId: string): Promise<void> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await contentPipelineApi.toggleRule(ruleId);
      setRules((prev) =>
        prev.map((r) => (r.rule_id === ruleId ? res.data : r)),
      );
      if (selectedRule && selectedRule.rule_id === ruleId) {
        setSelectedRule(res.data);
      }
      logger.info('Rule toggled', { ruleId, enabled: res.data.enabled });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to toggle rule';
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedRule]);

  const testRules = useCallback(async (params: TestPipelineRuleParams): Promise<void> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await contentPipelineApi.testRules(params);
      setTestResult(res);
      logger.info('Rules tested', { wouldIngest: res.would_ingest, reason: res.reason });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to test rules';
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const getStats = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await contentPipelineApi.getStats();
      setStats(res.data);
      logger.info('Stats loaded', { total: res.data.total });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch stats';
      setError(msg);
      logger.error('Stats fetch failed', { error: msg });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSources = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await contentPipelineApi.getSources();
      setSources(res.data);
      logger.info('Sources loaded', { count: res.data.length });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch sources';
      setError(msg);
      logger.error('Sources fetch failed', { error: msg });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSenders = useCallback(async (source?: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await contentPipelineApi.getSenders(source);
      setSenders(res.data);
      logger.info('Senders loaded', { count: res.data.length });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch senders';
      setError(msg);
      logger.error('Senders fetch failed', { error: msg });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    rules,
    selectedRule,
    stats,
    sources,
    senders,
    testResult,
    isLoading,
    isSubmitting,
    error,
    listRules,
    getRule,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    testRules,
    getStats,
    getSources,
    getSenders,
    clearError,
  };
};
