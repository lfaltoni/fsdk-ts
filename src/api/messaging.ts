// Messaging API — framework-agnostic, pure TypeScript async functions
// No React imports. Any JS/TS consumer can call these directly.

import type {
  Conversation,
  ConversationWithDetails,
  ConversationListResponse,
  ChatMessage,
  MessageListResponse,
  CreateConversationRequest,
  SendMessageRequest,
  UnreadCountResponse,
} from '../types/messaging';
import { getLogger } from '../utils/logging';
import { foundationRequest } from './foundation-client';

const logger = getLogger('messaging-api');

export const messagingApi = {
  /**
   * List the current user's conversations, ordered by most recent message.
   */
  getConversations: async (
    page = 1,
    perPage = 20,
  ): Promise<ConversationListResponse> => {
    logger.info('Fetching conversations', { page, perPage });
    try {
      const response = await foundationRequest<ConversationListResponse>(
        `/api/messaging/conversations?page=${page}&per_page=${perPage}`,
      );
      logger.info('Conversations fetched', { total: response.total });
      return response;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to fetch conversations', { error: msg });
      throw error;
    }
  },

  /**
   * Create a new conversation (or get existing via get_or_create).
   */
  createConversation: async (
    data: CreateConversationRequest,
  ): Promise<Conversation> => {
    logger.info('Creating conversation', { contextType: data.context_type, contextId: data.context_id });
    try {
      const response = await foundationRequest<Conversation>(
        '/api/messaging/conversations',
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
      );
      logger.info('Conversation created/found', { conversationId: response.conversation_id });
      return response;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to create conversation', { error: msg });
      throw error;
    }
  },

  /**
   * Get a single conversation by ID with enriched details.
   */
  getConversation: async (
    conversationId: string,
  ): Promise<ConversationWithDetails> => {
    logger.info('Fetching conversation', { conversationId });
    try {
      const response = await foundationRequest<ConversationWithDetails>(
        `/api/messaging/conversations/${encodeURIComponent(conversationId)}`,
      );
      return response;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to fetch conversation', { error: msg, conversationId });
      throw error;
    }
  },

  /**
   * Get a conversation by context type and ID.
   */
  getConversationByContext: async (
    contextType: string,
    contextId: string,
  ): Promise<ConversationWithDetails> => {
    logger.info('Fetching conversation by context', { contextType, contextId });
    try {
      const response = await foundationRequest<ConversationWithDetails>(
        `/api/messaging/conversations/context/${encodeURIComponent(contextType)}/${encodeURIComponent(contextId)}`,
      );
      return response;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to fetch conversation by context', { error: msg, contextType, contextId });
      throw error;
    }
  },

  /**
   * Get messages in a conversation (paginated). Marks unread messages as read.
   */
  getMessages: async (
    conversationId: string,
    page = 1,
    perPage = 50,
  ): Promise<MessageListResponse> => {
    logger.info('Fetching messages', { conversationId, page });
    try {
      const response = await foundationRequest<MessageListResponse>(
        `/api/messaging/conversations/${encodeURIComponent(conversationId)}/messages?page=${page}&per_page=${perPage}`,
      );
      logger.info('Messages fetched', { conversationId, total: response.total });
      return response;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to fetch messages', { error: msg, conversationId });
      throw error;
    }
  },

  /**
   * Send a message in a conversation.
   */
  sendMessage: async (
    conversationId: string,
    data: SendMessageRequest,
  ): Promise<ChatMessage> => {
    logger.info('Sending message', { conversationId });
    try {
      const response = await foundationRequest<ChatMessage>(
        `/api/messaging/conversations/${encodeURIComponent(conversationId)}/messages`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
      );
      logger.info('Message sent', { messageId: response.message_id, conversationId });
      return response;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to send message', { error: msg, conversationId });
      throw error;
    }
  },

  /**
   * Get total unread message count across all conversations.
   */
  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    try {
      return await foundationRequest<UnreadCountResponse>('/api/messaging/unread');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to fetch unread count', { error: msg });
      throw error;
    }
  },
};
