'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { X, MessageSquare, Plus } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { conversationService } from '@/services/conversation-service';
import type { Conversation } from '@/types/chat.types';

interface ConversationSheetProps {
  currentId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ConversationSheet({
  currentId,
  isOpen,
  onClose,
}: ConversationSheetProps) {
  const { accessToken } = useUserStore();
  const router = useRouter();

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => conversationService.list(accessToken!),
    enabled: !!accessToken,
  });

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Prevent body scroll while sheet is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 glass-dark rounded-t-3xl border-t border-border transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '75vh' }}
        role="dialog"
        aria-label="Conversation history"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 border-b border-border">
          <h2 className="text-heading font-semibold text-foreground">
            Conversations
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* New chat button */}
        <div className="px-4 pt-3 pb-2">
          <button
            onClick={() => {
              onClose();
              router.push('/chat');
            }}
            className="w-full rounded-xl bg-gold/10 border border-gold/20 px-4 py-3 flex items-center gap-3 text-gold hover:bg-gold/20 transition-colors"
          >
            <Plus size={18} />
            <span className="text-body font-medium">New conversation</span>
          </button>
        </div>

        {/* Conversation list */}
        <div className="overflow-y-auto px-4 pb-6 space-y-1" style={{ maxHeight: '50vh' }}>
          {conversations.map((conv: Conversation) => (
            <button
              key={conv.id}
              onClick={() => {
                onClose();
                router.push(`/chat/${conv.id}`);
              }}
              className={`w-full rounded-xl px-4 py-3 flex items-center gap-3 text-left transition-colors ${
                conv.id === currentId
                  ? 'bg-gold/15 border border-gold/30'
                  : 'hover:bg-white/5'
              }`}
            >
              <MessageSquare
                size={16}
                className={conv.id === currentId ? 'text-gold' : 'text-muted-foreground'}
              />
              <div className="flex-1 min-w-0">
                <p
                  className={`text-body truncate ${
                    conv.id === currentId
                      ? 'text-gold font-medium'
                      : 'text-foreground'
                  }`}
                >
                  {conv.title}
                </p>
                <p className="text-micro text-muted-foreground">
                  {new Date(conv.updated_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
              {conv.id === currentId && (
                <div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}