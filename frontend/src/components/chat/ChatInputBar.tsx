"use client";
import { useState, useRef, type KeyboardEvent } from "react";
import { Plus, Mic, ArrowUp, Loader2 } from "lucide-react";
import { useChatStore } from "@/store/chatStore";

interface ChatInputBarProps {
  onSend:    (content: string) => void;
  disabled?: boolean;
}

export function ChatInputBar({ onSend, disabled = false }: ChatInputBarProps) {
  const [content, setContent] = useState("");
  const textareaRef           = useRef<HTMLTextAreaElement>(null);
  const { streaming }         = useChatStore();

  const isSending  = disabled || streaming.isStreaming;
  const hasContent = content.trim().length > 0;

  const handleSend = () => {
    const trimmed = content.trim();
    if (!trimmed || isSending) return;
    onSend(trimmed);
    setContent("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  return (
    <div
      className="shrink-0 px-4 py-3 glass-dark border-t border-border"
      style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-end gap-2.5 max-w-2xl mx-auto">
        {/* + attachment */}
        <button
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-muted-foreground flex-shrink-0"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          aria-label="Attachment"
          disabled={isSending}
        >
          <Plus size={20} />
        </button>

        {/* Text input */}
        <div
          className="flex-1 rounded-3xl px-4 py-2.5 transition-all"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.09)",
            outline: "none",
          }}
        >
          <textarea
            ref={textareaRef}
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Ask anything…"
            disabled={isSending}
            rows={1}
            className="w-full bg-transparent text-body text-foreground placeholder:text-muted-foreground resize-none outline-none leading-relaxed disabled:opacity-50"
            style={{ maxHeight: "160px" }}
          />
        </div>

        {/* Mic / Send — gold button */}
        <button
          onClick={hasContent ? handleSend : undefined}
          disabled={isSending && !streaming.isStreaming}
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
          style={{
            background: "linear-gradient(135deg, #F59E0B, #D97706)",
            boxShadow: "0 0 20px rgba(245,158,11,0.4), 0 4px 12px rgba(0,0,0,0.4)",
            opacity: isSending && !hasContent ? 0.7 : 1,
          }}
          aria-label={hasContent ? "Send" : "Voice input"}
        >
          {isSending ? (
            <Loader2 size={20} className="text-black animate-spin" />
          ) : hasContent ? (
            <ArrowUp size={20} className="text-black" strokeWidth={2.5} />
          ) : (
            <Mic size={20} className="text-black" strokeWidth={2} />
          )}
        </button>
      </div>
    </div>
  );
}
