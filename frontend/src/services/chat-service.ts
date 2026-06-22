/* eslint-disable @typescript-eslint/no-unused-vars */
// Placeholder file — streamMessage params are intentionally stubbed.
// Stage 5.3 implements SSE streaming; this disable is removed then.

import type { Message, MessageExchange } from '@/types/chat.types';
import type { AIModel } from '@/types/ai.types';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

interface SendMessagePayload {
  content: string;
  model: AIModel;
}

export const chatService = {
  // Non-streaming send — used now (Stage 5.3 will also add streaming)
  sendMessage: async (
    conversationId: string,
    payload: SendMessagePayload,
    token: string,
  ): Promise<MessageExchange> => {
    const response = await fetch(
      `${BASE_URL}/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body?.detail ?? `HTTP ${response.status}`);
    }

    return response.json();
  },

  listMessages: async (
    conversationId: string,
    token: string,
  ): Promise<Message[]> => {
    const response = await fetch(
      `${BASE_URL}/conversations/${conversationId}/messages`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  // Streaming via SSE — Stage 5.3
  // Placeholder here so the service layer's shape is complete.
  streamMessage: async (
    _conversationId: string,
    _payload: SendMessagePayload,
    _token: string,
    _onToken: (token: string) => void,
    _onDone: () => void,
  ): Promise<void> => {
    console.warn('streamMessage: SSE streaming implemented in Stage 5.3');
  },
};