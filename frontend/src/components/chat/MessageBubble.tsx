'use client';

import { Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import type { Message } from '@/types/chat.types';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
  };

  const timestamp = new Date(message.created_at).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  if (isUser) {
    return (
      <div className="flex justify-end px-4">
        <div className="max-w-[80%] space-y-1">
          <div
            className="rounded-2xl rounded-tr-sm px-4 py-3"
            style={{ background: 'var(--pyro-surface-dark2)' }}
          >
            <p className="text-body text-foreground whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>
          <p className="text-micro text-muted-foreground text-right pr-1">
            {timestamp} ✓✓
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 px-4">
      {/* AI bubble */}
      <div className="flex items-start gap-2 max-w-[88%]">
        {/* Spark icon */}
        <div className="w-7 h-7 rounded-lg bg-gold/20 border border-gold/30 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-micro text-gold leading-none">✦</span>
        </div>

        <div
          className="flex-1 rounded-2xl rounded-tl-sm px-4 py-3"
          style={{ background: 'var(--pyro-surface-dark)' }}
        >
          <p className="text-body text-foreground whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
      </div>

      {/* Action row — below the bubble, left-aligned */}
      <div className="flex items-center gap-1 pl-9">
        <ActionButton icon={<Copy size={14} />} label="Copy" onClick={handleCopy} />
        <ActionButton icon={<ThumbsUp size={14} />} label="Like" onClick={() => {}} />
        <ActionButton icon={<ThumbsDown size={14} />} label="Dislike" onClick={() => {}} />
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
      aria-label={label}
    >
      {icon}
    </button>
  );
}