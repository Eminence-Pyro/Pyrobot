"use client";
import { Copy, ThumbsUp, ThumbsDown, RefreshCw, Share2, Bookmark } from "lucide-react";
import type { Message } from "@/types/chat.types";

const BUBBLE_ENTER: React.CSSProperties = {
  animation: "bubbleEnter 0.22s ease-out forwards",
};

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const time   = formatTime(message.created_at);

  const copy = () => navigator.clipboard.writeText(message.content);

  if (isUser) {
    return (
      <div className="flex justify-end px-4 mb-3" style={BUBBLE_ENTER}>
        <div className="max-w-[80%] space-y-1">
          <div className="bubble-user px-4 py-3">
            <p className="text-body text-foreground whitespace-pre-wrap break-words leading-relaxed">
              {message.content}
            </p>
          </div>
          <p className="text-micro text-muted-foreground text-right pr-1">
            {time} <span className="text-gold">✓✓</span>
          </p>
        </div>
      </div>
    );
  }

  // AI bubble
  return (
    <div className="flex flex-col gap-1.5 px-4 mb-4" style={BUBBLE_ENTER}>
      <div className="flex items-start gap-2.5 max-w-[88%]">
        {/* AI avatar */}
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 animate-sparkle"
          style={{
            background: "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.05))",
            border: "1px solid rgba(245,158,11,0.3)",
          }}
        >
          <span style={{ fontSize: "0.8rem", lineHeight: 1 }}>✦</span>
        </div>

        {/* Bubble */}
        <div className="bubble-ai px-4 py-3 flex-1">
          <p className="text-body text-foreground whitespace-pre-wrap break-words leading-relaxed">
            {message.content}
          </p>
        </div>
      </div>

      {/* Action row */}
      <div className="flex items-center gap-0.5 pl-10">
        {[
          { icon: <Copy size={14} />,       label: "Copy",    action: copy },
          { icon: <ThumbsUp size={14} />,   label: "Like",    action: () => {} },
          { icon: <ThumbsDown size={14} />, label: "Dislike", action: () => {} },
          { icon: <Bookmark size={14} />,   label: "Save",    action: () => {} },
          { icon: <RefreshCw size={14} />,  label: "Retry",   action: () => {} },
          { icon: <Share2 size={14} />,     label: "Share",   action: () => {} },
        ].map(({ icon, label, action }) => (
          <button
            key={label}
            onClick={action}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/8 transition-colors"
            aria-label={label}
          >
            {icon}
          </button>
        ))}
      </div>
    </div>
  );
}
