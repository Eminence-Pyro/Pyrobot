"use client";
import { useState, useRef, type KeyboardEvent } from "react";
import { Mic, ArrowUp, Loader2, Plus } from "lucide-react";
import { useChatStore } from "@/store/chatStore";

interface ChatInputBarProps {
  onSend:    (content: string) => void;
  disabled?: boolean;
}

export function ChatInputBar({ onSend, disabled = false }: ChatInputBarProps) {
  const [content, setContent] = useState("");
  const ref                   = useRef<HTMLTextAreaElement>(null);
  const { streaming }         = useChatStore();

  const busy       = disabled || streaming.isStreaming;
  const hasContent = content.trim().length > 0;

  const send = () => {
    const t = content.trim();
    if (!t || busy) return;
    onSend(t);
    setContent("");
    if (ref.current) ref.current.style.height = "auto";
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const onInput = () => {
    if (!ref.current) return;
    ref.current.style.height = "auto";
    ref.current.style.height = Math.min(ref.current.scrollHeight, 152) + "px";
  };

  return (
    <div
      className="shrink-0 px-4 py-3 glass-bottom"
      style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-end gap-2.5 max-w-2xl mx-auto">
        {/* + button */}
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground flex-shrink-0 transition-colors hover:text-foreground"
          style={{ background: "var(--muted)", border: "1px solid var(--border)" }}
          aria-label="Add"
          disabled={busy}
        >
          <Plus size={19} strokeWidth={1.8} />
        </button>

        {/* Text input pill */}
        <div className="flex-1 input-pill">
          <textarea
            ref={ref}
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyDown={onKey}
            onInput={onInput}
            placeholder="Ask anything…"
            disabled={busy}
            rows={1}
            className="flex-1 bg-transparent text-body text-foreground placeholder:text-muted-foreground resize-none outline-none leading-relaxed disabled:opacity-50 w-full"
            style={{ maxHeight: "152px" }}
          />
        </div>

        {/* Mic / Send */}
        <button
          onClick={send}
          disabled={busy && !streaming.isStreaming}
          className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-white transition-all active:scale-90"
          style={{
            background: "linear-gradient(135deg, #D4920E, #C17D0A)",
            boxShadow: "0 0 16px rgba(193,125,10,0.4), 0 3px 8px rgba(0,0,0,0.2)",
          }}
          aria-label={hasContent ? "Send" : "Voice"}
        >
          {busy
            ? <Loader2 size={19} className="animate-spin" />
            : hasContent
              ? <ArrowUp size={19} strokeWidth={2.5} />
              : <Mic size={19} strokeWidth={1.8} />}
        </button>
      </div>
    </div>
  );
}
