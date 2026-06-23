import { apiClient } from './api-client';
import type { Conversation } from '@/types/chat.types';

export const conversationService = {
  list: (token: string) =>
    apiClient.get<Conversation[]>('/conversations', token),

  create: (payload: { title: string }, token: string) =>
    apiClient.post<Conversation>('/conversations', payload, token),

  get: (id: string, token: string) =>
    apiClient.get<Conversation>(`/conversations/${id}`, token),
};