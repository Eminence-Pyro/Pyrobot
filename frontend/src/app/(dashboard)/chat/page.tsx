'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Plus, MessageSquare, ChevronRight } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { conversationService } from '@/services/conversation-service';
import { PageTransition } from '@/components/providers/PageTransition';
import type { Conversation } from '@/types/chat.types';

export default function ChatPage() {
  const { accessToken } = useUserStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => conversationService.list(accessToken!),
    enabled: !!accessToken,
  });

  const createConversation = useMutation({
    mutationFn: () =>
      conversationService.create({ title: 'New Chat' }, accessToken!),
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      router.push(`/chat/${conversation.id}`);
    },
  });

  return (
    <PageTransition>
      <div className="flex flex-col h-full px-4 py-6 max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-title font-bold text-foreground">Chats</h1>
            <p className="text-caption text-muted-foreground mt-0.5">
              Your conversations with Pyrobot
            </p>
          </div>
          <button
            onClick={() => createConversation.mutate()}
            disabled={createConversation.isPending}
            className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center text-white active:scale-95 transition-transform disabled:opacity-60"
            aria-label="New chat"
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && conversations.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center">
              <span className="text-2xl">✦</span>
            </div>
            <div>
              <p className="text-heading font-semibold text-foreground mb-1">
                No chats yet
              </p>
              <p className="text-body text-muted-foreground">
                Start your first conversation
              </p>
            </div>
            <button
              onClick={() => createConversation.mutate()}
              disabled={createConversation.isPending}
              className="rounded-xl bg-gold px-6 py-3 text-body font-semibold text-white active:scale-95 transition-transform disabled:opacity-60"
            >
              Start chatting
            </button>
          </div>
        )}

        {/* Conversation list */}
        {conversations.length > 0 && (
          <div className="space-y-2">
            {conversations.map((conv: Conversation) => (
              <button
                key={conv.id}
                onClick={() => router.push(`/chat/${conv.id}`)}
                className="w-full glass-light dark:glass-medium rounded-2xl px-4 py-4 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
              >
                <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                  <MessageSquare size={18} className="text-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body font-medium text-foreground truncate">
                    {conv.title}
                  </p>
                  <p className="text-caption text-muted-foreground">
                    {new Date(conv.updated_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}