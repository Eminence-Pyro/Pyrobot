"use client";
import { Copy, ThumbsUp, ThumbsDown, RefreshCw, Bookmark } from "lucide-react";
import type { Message } from "@/types/chat.types";

const IN: React.CSSProperties = { animation: "bubbleEnter 0.22s ease-out forwards" };

function fmt(d: string) {
  return new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const time   = fmt(message.created_at);

  if (isUser) {
    return (
      <div className="flex justify-end px-4 mb-3" style={IN}>
        <div className="max-w-[80%]">
          <div className="bubble-user px-4 py-3">
            <p className="text-body text-foreground whitespace-pre-wrap break-words leading-relaxed">
              {message.content}
            </p>
          </div>
          <p className="text-micro text-muted-foreground text-right mt-1 pr-1">
            {time}{" "}
            <span className="gold-text">✓✓</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 px-4 mb-4" style={IN}>
      <div className="flex items-start gap-2.5 max-w-[88%]">
        {/* AI avatar — small flame */}
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{
            background: "linear-gradient(135deg, rgba(212,146,14,0.18), rgba(212,146,14,0.06))",
            border: "1px solid rgba(212,146,14,0.25)",
          }}
        >
          <span style={{ fontSize: "0.85rem" }}>🔥</span>
        </div>

        <div className="bubble-ai px-4 py-3 flex-1">
          <p className="text-body text-foreground whitespace-pre-wrap break-words leading-relaxed">
            {message.content}
          </p>
        </div>
      </div>

      {/* Action row */}
      <div className="flex items-center gap-0.5 pl-10">
        {[
          { icon: <Copy size={13} />,       label: "Copy",    fn: () => navigator.clipboard.writeText(message.content) },
          { icon: <ThumbsUp size={13} />,   label: "Like",    fn: () => {} },
          { icon: <ThumbsDown size={13} />, label: "Dislike", fn: () => {} },
          { icon: <Bookmark size={13} />,   label: "Save",    fn: () => {} },
          { icon: <RefreshCw size={13} />,  label: "Retry",   fn: () => {} },
        ].map(({ icon, label, fn }) => (
          <button
            key={label}
            onClick={fn}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/8 transition-colors"
            aria-label={label}
          >
            {icon}
          </button>
        ))}
      </div>
    </div>
  );
}
