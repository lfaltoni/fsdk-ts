// Messaging types — matches foundation-sdk messaging API response shapes

export interface Participant {
  user_id: string;
  first_name: string;
  last_name: string;
}

export interface Conversation {
  conversation_id: string;
  participant_a: string;
  participant_b: string;
  context_type: string;
  context_id: string;
  status: 'active' | 'archived';
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConversationWithDetails extends Conversation {
  other_participant: Participant;
  last_message_preview: string | null;
  unread_count: number;
}

export interface ConversationListResponse {
  conversations: ConversationWithDetails[];
  total: number;
  page: number;
  per_page: number;
  has_next: boolean;
}

export interface ChatMessage {
  message_id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
}

export interface MessageListResponse {
  messages: ChatMessage[];
  total: number;
  page: number;
  per_page: number;
  has_next: boolean;
}

export interface CreateConversationRequest {
  participant_b: string;
  context_type: string;
  context_id: string;
}

export interface SendMessageRequest {
  body: string;
}

export interface UnreadCountResponse {
  unread_count: number;
}
