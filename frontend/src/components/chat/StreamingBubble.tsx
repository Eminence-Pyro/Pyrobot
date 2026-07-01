"use client";
import { useChatStore } from "@/store/chatStore";

export function StreamingBubble() {
  const { streaming } = useChatStore();
  if (!streaming.isStreaming && !streaming.content) return null;

  return (
    <div className="flex items-start gap-2.5 px-4 mb-4"
      style={{animation:"bubbleEnter 0.22s ease-out forwards"}}>
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 animate-sparkle"
        style={{
          background:"linear-gradient(135deg,rgba(245,158,11,0.2),rgba(245,158,11,0.05))",
          border:"1px solid rgba(245,158,11,0.3)",
        }}
      >
        <span style={{fontSize:"0.85rem",lineHeight:1}}>✦</span>
      </div>
      <div className="bubble-ai px-4 py-3 flex-1 max-w-[88%]">
        {streaming.content ? (
          <p className="text-body text-foreground whitespace-pre-wrap break-words leading-relaxed">
            {streaming.content}
            <span
              className="inline-block w-0.5 h-4 ml-0.5 rounded-full align-middle animate-pulse"
              style={{background:"var(--pyro-gold)"}}
            />
          </p>
        ) : (
          <div className="flex items-center gap-1.5 py-1">
            {[0,1,2].map(i=>(
              <div key={i} className="w-2 h-2 rounded-full"
                style={{
                  background:"var(--pyro-gold)",opacity:0.65,
                  animation:`pulse 1.2s ${i*0.22}s ease-in-out infinite`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
