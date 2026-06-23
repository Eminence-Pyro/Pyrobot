'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '@/store/userStore';
import { memoryService } from '@/services/memory-service';
import { Brain, Trash2 } from 'lucide-react';

export default function MemoriesPage() {
  const { accessToken } = useUserStore();
  const queryClient = useQueryClient();

  const { data: memories = [], isLoading } = useQuery({
    queryKey: ['memory'],
    queryFn: () => memoryService.getAll(accessToken!),
    enabled: !!accessToken,
  });

  const deleteMemory = useMutation({
    mutationFn: (key: string) => memoryService.delete(key, accessToken!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['memory'] }),
  });

  const clearAll = useMutation({
    mutationFn: () => memoryService.clear(accessToken!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['memory'] }),
  });

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-title font-bold text-foreground">Memory</h1>
          <p className="text-body text-muted-foreground mt-1">
            What Pyrobot knows about you
          </p>
        </div>
        {memories.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Clear all memory? This cannot be undone.')) {
                clearAll.mutate();
              }
            }}
            disabled={clearAll.isPending}
            className="flex items-center gap-1.5 text-caption text-destructive hover:opacity-70 disabled:opacity-40 transition-opacity"
          >
            <Trash2 size={14} />
            Clear all
          </button>
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
        </div>
      )}

      {!isLoading && memories.length === 0 && (
        <div className="glass-light dark:glass-medium rounded-2xl p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-4">
            <Brain size={22} className="text-gold" />
          </div>
          <p className="text-body font-medium text-foreground mb-1">No memories yet</p>
          <p className="text-caption text-muted-foreground">
            Start chatting and Pyrobot will build context about you.
          </p>
        </div>
      )}

      {memories.length > 0 && (
        <div className="space-y-2">
          {memories.map((memory) => (
            <div
              key={memory.key}
              className="glass-light dark:glass-medium rounded-2xl px-4 py-4 flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0 mt-0.5">
                <Brain size={14} className="text-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-caption font-semibold text-gold capitalize">
                  {memory.key.replace(/_/g, ' ')}
                </p>
                <p className="text-body text-foreground mt-0.5 break-words">
                  {typeof memory.value === 'object'
                    ? (memory.value as Record<string, string>).text ??
                      JSON.stringify(memory.value)
                    : String(memory.value)}
                </p>
                <p className="text-micro text-muted-foreground mt-1">
                  {new Date(memory.updated_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </p>
              </div>
              <button
                onClick={() => deleteMemory.mutate(memory.key)}
                disabled={deleteMemory.isPending}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors shrink-0 disabled:opacity-40"
                aria-label={`Delete ${memory.key}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}