import { apiClient } from './api-client';
import type { User, AuthTokens } from '@/types/user.types';

interface RegisterPayload {
  email: string;
  username: string;
  password: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

export const authService = {
  register: (payload: RegisterPayload) =>
    apiClient.post<User>('/auth/register', payload),

  login: (payload: LoginPayload) =>
    apiClient.post<AuthTokens>('/auth/login', payload),

  me: (token: string) =>
    apiClient.get<User>('/auth/me', token),
};