import { create } from 'zustand';
import type { Conversation, Message, StreamingState } from '@/types/chat.types';
import type { AIModel } from '@/types/ai.types';
import { DEFAULT_MODEL } from '@/types/ai.types';

interface ChatStore {
  activeConversation: Conversation | null;
  messages: Message[];
  streaming: StreamingState;
  selectedModel: AIModel;
  setActiveConversation: (conversation: Conversation | null) => void;
  setMessages: (messages: Message[]) => void;
  appendMessage: (message: Message) => void;
  appendStreamingToken: (token: string) => void;
  finalizeStream: (assistantMessage: Message) => void;
  setSelectedModel: (model: AIModel) => void;
  reset: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  activeConversation: null,
  messages: [],
  streaming: { isStreaming: false, streamingContent: '' },
  selectedModel: DEFAULT_MODEL,

  setActiveConversation: (conversation) =>
    set({ activeConversation: conversation }),

  setMessages: (messages) => set({ messages }),

  appendMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  appendStreamingToken: (token) =>
    set((state) => ({
      streaming: {
        isStreaming: true,
        streamingContent: state.streaming.streamingContent + token,
      },
    })),

  // Called when SSE stream ends — replaces the streaming buffer
  // with the real persisted message from Stage 4.2.
  finalizeStream: (assistantMessage) =>
    set((state) => ({
      messages: [...state.messages, assistantMessage],
      streaming: { isStreaming: false, streamingContent: '' },
    })),

  setSelectedModel: (model) => set({ selectedModel: model }),

  reset: () =>
    set({
      activeConversation: null,
      messages: [],
      streaming: { isStreaming: false, streamingContent: '' },
    }),
}));