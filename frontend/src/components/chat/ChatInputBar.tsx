'use client';

import { useState, useRef, type KeyboardEvent } from 'react';
import { Plus, Mic, ArrowUp, Loader2 } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';

interface ChatInputBarProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export function ChatInputBar({ onSend, disabled = false }: ChatInputBarProps) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { streaming } = useChatStore();

  const isSending = disabled || streaming.isStreaming;
  const hasContent = content.trim().length > 0;

  const handleSend = () => {
    const trimmed = content.trim();
    if (!trimmed || isSending) return;
    onSend(trimmed);
    setContent('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  return (
    <div className="shrink-0 px-4 py-3 glass-dark border-t border-border">
      <div className="flex items-end gap-3">
        {/* Attachment button */}
        <button
          className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors shrink-0"
          aria-label="Add attachment"
          disabled={isSending}
        >
          <Plus size={20} />
        </button>

        {/* Text input */}
        <div className="flex-1 rounded-2xl bg-white/5 border border-white/10 px-4 py-2.5 focus-within:border-gold/50 transition-colors">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Ask anything…"
            disabled={isSending}
            rows={1}
            className="w-full bg-transparent text-body text-foreground placeholder:text-muted-foreground resize-none outline-none leading-relaxed disabled:opacity-50"
            style={{ maxHeight: '160px' }}
          />
        </div>

        {/* Send / Mic button */}
        <button
          onClick={hasContent ? handleSend : undefined}
          disabled={isSending && !streaming.isStreaming}
          className="w-10 h-10 rounded-full bg-gold flex items-center justify-center text-white shrink-0 active:scale-95 transition-all disabled:opacity-60"
          aria-label={hasContent ? 'Send message' : 'Voice input'}
        >
          {streaming.isStreaming ? (
            <Loader2 size={18} className="animate-spin" />
          ) : hasContent ? (
            <ArrowUp size={18} strokeWidth={2.5} />
          ) : (
            <Mic size={18} />
          )}
        </button>
      </div>

      <p className="text-micro text-muted-foreground text-center mt-2">
        Pyrobot can make mistakes. Verify important information.
      </p>
    </div>
  );
}