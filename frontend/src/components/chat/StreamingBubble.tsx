'use client';

import { useChatStore } from '@/store/chatStore';

export function StreamingBubble() {
  const { streaming } = useChatStore();

  if (!streaming.isStreaming && !streaming.streamingContent) return null;

  return (
    <div className="flex items-start gap-2 px-4 max-w-[88%]">
      <div className="w-7 h-7 rounded-lg bg-gold/20 border border-gold/30 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-micro text-gold leading-none">✦</span>
      </div>

      <div
        className="flex-1 rounded-2xl rounded-tl-sm px-4 py-3"
        style={{ background: 'var(--pyro-surface-dark)' }}
      >
        {streaming.streamingContent ? (
          <p className="text-body text-foreground whitespace-pre-wrap break-words">
            {streaming.streamingContent}
            <span className="inline-block w-0.5 h-4 bg-gold ml-0.5 animate-pulse align-middle" />
          </p>
        ) : (
          <div className="flex items-center gap-1 py-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-gold/60 animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}