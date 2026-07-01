"use client";
import { useState, useRef, type KeyboardEvent } from "react";
import { Plus, Mic, ArrowUp, Loader2 } from "lucide-react";
import { useChatStore } from "@/store/chatStore";

interface ChatInputBarProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export function ChatInputBar({ onSend, disabled = false }: ChatInputBarProps) {
  const [content, setContent] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  const { streaming } = useChatStore();

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
      className="flex-shrink-0 px-4 py-3 glass-bar border-t"
      style={{ paddingBottom:"max(12px,env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-end gap-2.5 max-w-2xl mx-auto">
        {/* + button */}
        <button
          disabled={busy}
          className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          style={{background:"var(--pyro-surface-2)",border:"1px solid var(--border)"}}
          aria-label="Attach"
        >
          <Plus size={19} strokeWidth={1.8}/>
        </button>

        {/* Input pill */}
        <div className="input-pill flex-1">
          <textarea
            ref={ref}
            value={content}
            onChange={e=>setContent(e.target.value)}
            onKeyDown={onKey}
            onInput={onInput}
            placeholder="Ask anything…"
            disabled={busy}
            rows={1}
            className="flex-1 w-full bg-transparent text-body text-foreground placeholder:text-muted-foreground resize-none outline-none leading-relaxed disabled:opacity-50"
            style={{maxHeight:152}}
          />
        </div>

        {/* Gold round send/mic */}
        <button
          onClick={send}
          disabled={busy && !streaming.isStreaming}
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 gold-gradient gold-glow text-black transition-all active:scale-90"
          aria-label={hasContent ? "Send" : "Voice input"}
        >
          {busy
            ? <Loader2 size={20} className="animate-spin"/>
            : hasContent
              ? <ArrowUp size={20} strokeWidth={2.5}/>
              : <Mic size={20} strokeWidth={2}/>}
        </button>
      </div>
    </div>
  );
}
