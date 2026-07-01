"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, MoreHorizontal } from "lucide-react";

interface ChatTopBarProps {
  title?: string;
  model?: string;
}

export function ChatTopBar({ title = "Chat with Pyrobot", model = "GPT-4o" }: ChatTopBarProps) {
  const router = useRouter();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-border"
      style={{ height: 60 }}
    >
      <div className="flex items-center justify-between px-4 h-full">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-white/5"
          aria-label="Go back"
        >
          <ArrowLeft size={22} />
        </button>

        {/* Title + model pill */}
        <div className="flex flex-col items-center gap-1">
          <p className="text-heading font-bold text-foreground">
            {title} <span className="gold-gradient-text">✦</span>
          </p>

          {/* Model selector pill */}
          <button
            className="flex items-center gap-1.5 px-3 py-0.5 rounded-full"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: "#22C55E" }}
            />
            <span className="text-micro text-foreground font-medium">{model}</span>
            <ChevronDown size={11} className="text-muted-foreground" />
          </button>
        </div>

        {/* More options */}
        <button
          className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-white/5"
          aria-label="More options"
        >
          <MoreHorizontal size={22} />
        </button>
      </div>
    </header>
  );
}
