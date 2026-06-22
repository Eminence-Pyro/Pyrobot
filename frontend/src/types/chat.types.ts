export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface MessageExchange {
  user_message: Message;
  assistant_message: Message;
}

export interface StreamingState {
  isStreaming: boolean;
  streamingContent: string;
}