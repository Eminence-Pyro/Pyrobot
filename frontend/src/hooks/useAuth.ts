'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth-service';
import { useUserStore } from '@/store/userStore';
import type { LoginValues, RegisterValues } from '@/lib/validations/auth';

export function useLogin() {
  const { setUser } = useUserStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (values: LoginValues) => {
      // Step 1: get the token
      const tokens = await authService.login(values);
      // Step 2: use the token to fetch the full user profile
      const user = await authService.me(tokens.access_token);
      return { user, accessToken: tokens.access_token };
    },
    onSuccess: ({ user, accessToken }) => {
      // Persist to store — survives page refresh via localStorage
      setUser(user, accessToken);
      // Invalidate any stale queries that depended on auth state
      queryClient.invalidateQueries();
      router.replace('/chat');
    },
  });
}

export function useRegister() {
  const { setUser } = useUserStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async (values: RegisterValues) => {
      // Register, then immediately log in — the register endpoint
      // returns the user object but not a token (confirmed from
      // test_auth.py: register → separate login call to get JWT).
      await authService.register(values);
      const tokens = await authService.login({
        email: values.email,
        password: values.password,
      });
      const user = await authService.me(tokens.access_token);
      return { user, accessToken: tokens.access_token };
    },
    onSuccess: ({ user, accessToken }) => {
      setUser(user, accessToken);
      router.replace('/chat');
    },
  });
}

export function useLogout() {
  const { clearUser } = useUserStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  return () => {
    clearUser();
    queryClient.clear();
    router.replace('/login');
  };
}