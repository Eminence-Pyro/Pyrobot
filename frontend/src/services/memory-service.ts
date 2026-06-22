import { apiClient } from './api-client';

export interface Memory {
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
}

export const memoryService = {
  getAll: (token: string) =>
    apiClient.get<Memory[]>('/memory', token),

  set: (key: string, value: Record<string, unknown>, token: string) =>
    apiClient.put<Memory>(`/memory/${key}`, { value }, token),

  delete: (key: string, token: string) =>
    apiClient.delete<void>(`/memory/${key}`, token),

  clear: (token: string) =>
    apiClient.delete<void>('/memory', token),
};