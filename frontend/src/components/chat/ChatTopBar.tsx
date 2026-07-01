"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, MoreHorizontal } from "lucide-react";

interface ChatTopBarProps {
  /** Called when the history sheet icon is tapped (existing prop) */
  onOpenSheet?: () => void;
}

export function ChatTopBar({ onOpenSheet }: ChatTopBarProps) {
  const router = useRouter();

  return (
    <header className="flex-shrink-0 flex items-center justify-between px-4 glass-bar border-b" style={{height:60}}>
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-xl transition-colors"
        aria-label="Back"
      >
        <ArrowLeft size={22} strokeWidth={1.8}/>
      </button>

      {/* Centre — title + model pill */}
      <div className="flex flex-col items-center gap-1.5 absolute left-1/2 -translate-x-1/2">
        <p className="text-heading font-bold text-foreground">
          Chat with Pyrobot{" "}
          <span className="gold-gradient-text">✦</span>
        </p>
        {/* Model pill */}
        <button
          className="flex items-center gap-1.5 px-3 py-0.5 rounded-full"
          style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)"}}
        >
          <span className="w-2 h-2 rounded-full" style={{background:"#22C55E"}}/>
          <span className="text-micro text-foreground font-medium">GPT-4o</span>
          <ChevronDown size={11} className="text-muted-foreground"/>
        </button>
      </div>

      {/* Options */}
      <button
        onClick={onOpenSheet}
        className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-xl transition-colors"
        aria-label="Options"
      >
        <MoreHorizontal size={22}/>
      </button>
    </header>
  );
}
