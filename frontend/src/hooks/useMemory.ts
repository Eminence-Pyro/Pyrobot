'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '@/store/userStore';
import { memoryService } from '@/services/memory-service';

// Read a single memory key. Returns undefined while loading or if not set.
export function useMemoryValue(key: string) {
  const { accessToken } = useUserStore();

  return useQuery({
    queryKey: ['memory', key],
    queryFn: async () => {
      const entries = await memoryService.getAll(accessToken!);
      const entry = entries.find((m) => m.key === key);
      return entry?.value?.text as string | undefined;
    },
    enabled: !!accessToken,
  });
}

// Write a single memory key. Invalidates the ['memory', key] query on success.
export function useSetMemory(key: string) {
  const { accessToken } = useUserStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (value: string) =>
      memoryService.set(key, { text: value }, accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memory', key] });
    },
  });
}

// Read all memory entries — used by the Memory page.
export function useAllMemory() {
  const { accessToken } = useUserStore();

  return useQuery({
    queryKey: ['memory'],
    queryFn: () => memoryService.getAll(accessToken!),
    enabled: !!accessToken,
  });
}

export function useClearMemory() {
  const { accessToken } = useUserStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => memoryService.clear(accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memory'] });
    },
  });
}