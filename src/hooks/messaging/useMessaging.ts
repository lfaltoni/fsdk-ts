import { useState, useEffect, useCallback, useRef } from 'react';
import { messagingApi } from '../../api/messaging';
import type {
  ConversationWithDetails,
  ChatMessage,
  CreateConversationRequest,
  SendMessageRequest,
} from '../../types/messaging';
import { getLogger } from '../../utils/logging';

const logger = getLogger('useMessaging');

// ============================================================================
// useConversations — list conversations with pagination
// ============================================================================

interface UseConversationsReturn {
  conversations: ConversationWithDetails[];
  total: number;
  page: number;
  hasNext: boolean;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  setPage: (page: number) => void;
  refetch: () => Promise<void>;
  createConversation: (data: CreateConversationRequest) => Promise<ConversationWithDetails>;
}

export function useConversations(perPage = 20): UseConversationsReturn {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await messagingApi.getConversations(page, perPage);
      setConversations(res.conversations);
      setTotal(res.total);
      setHasNext(res.has_next);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load conversations';
      logger.error('Failed to fetch conversations', { error: msg });
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [page, perPage]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  const createConversation = useCallback(async (data: CreateConversationRequest) => {
    try {
      const conv = await messagingApi.createConversation(data);
      // Refetch to include the new conversation in the list
      await fetchConversations();
      // Fetch full details
      const detailed = await messagingApi.getConversation(conv.conversation_id);
      return detailed;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to create conversation';
      logger.error('Failed to create conversation', { error: msg });
      setError(msg);
      throw e;
    }
  }, [fetchConversations]);

  return {
    conversations, total, page, hasNext,
    isLoading, error, clearError,
    setPage, refetch: fetchConversations,
    createConversation,
  };
}

// ============================================================================
// useConversation — single conversation: messages, send, poll
// ============================================================================

interface UseConversationReturn {
  conversation: ConversationWithDetails | null;
  messages: ChatMessage[];
  total: number;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  clearError: () => void;
  sendMessage: (body: string) => Promise<ChatMessage>;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

export function useConversation(
  conversationId: string | null,
  pollIntervalMs = 10000,
): UseConversationReturn {
  const [conversation, setConversation] = useState<ConversationWithDetails | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const fetchMessages = useCallback(async (append = false) => {
    if (!conversationId) return;
    if (!append) setIsLoading(true);
    setError(null);
    try {
      const [convRes, msgRes] = await Promise.all([
        messagingApi.getConversation(conversationId),
        messagingApi.getMessages(conversationId, append ? page : 1),
      ]);
      setConversation(convRes);
      if (append) {
        setMessages(prev => [...prev, ...msgRes.messages]);
      } else {
        setMessages(msgRes.messages);
      }
      setTotal(msgRes.total);
      setHasMore(msgRes.has_next);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load messages';
      logger.error('Failed to fetch messages', { error: msg, conversationId });
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, page]);

  // Initial fetch
  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  // Polling
  useEffect(() => {
    if (!conversationId || pollIntervalMs <= 0) return;

    pollRef.current = setInterval(async () => {
      try {
        const msgRes = await messagingApi.getMessages(conversationId, 1, 50);
        setMessages(msgRes.messages);
        setTotal(msgRes.total);
        setHasMore(msgRes.has_next);
      } catch {
        // Silently ignore poll errors
      }
    }, pollIntervalMs);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [conversationId, pollIntervalMs]);

  const sendMessage = useCallback(async (body: string) => {
    if (!conversationId) throw new Error('No conversation selected');
    setIsSending(true);
    setError(null);
    try {
      const msg = await messagingApi.sendMessage(conversationId, { body });
      setMessages(prev => [...prev, msg]);
      setTotal(prev => prev + 1);
      return msg;
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : 'Failed to send message';
      logger.error('Failed to send message', { error: errMsg, conversationId });
      setError(errMsg);
      throw e;
    } finally {
      setIsSending(false);
    }
  }, [conversationId]);

  const loadMore = useCallback(async () => {
    if (!hasMore) return;
    setPage(prev => prev + 1);
    await fetchMessages(true);
  }, [hasMore, fetchMessages]);

  return {
    conversation, messages, total,
    isLoading, isSending, error, clearError,
    sendMessage, refetch: fetchMessages, loadMore, hasMore,
  };
}

// ============================================================================
// useUnreadCount — global unread badge, polls periodically
// ============================================================================

interface UseUnreadCountReturn {
  unreadCount: number;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export function useUnreadCount(pollIntervalMs = 30000): UseUnreadCountReturn {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchCount = useCallback(async () => {
    try {
      const res = await messagingApi.getUnreadCount();
      setUnreadCount(res.unread_count);
    } catch {
      // Silently ignore — badge is non-critical
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => { fetchCount(); }, [fetchCount]);

  // Polling
  useEffect(() => {
    if (pollIntervalMs <= 0) return;

    pollRef.current = setInterval(fetchCount, pollIntervalMs);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [pollIntervalMs, fetchCount]);

  return { unreadCount, isLoading, refetch: fetchCount };
}
