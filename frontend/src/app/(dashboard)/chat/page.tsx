"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ChevronRight, Mic, ArrowUp, MessageSquare } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { conversationService } from "@/services/conversation-service";
import { PageTransition } from "@/components/providers/PageTransition";
import type { Conversation } from "@/types/chat.types";

const QUICK_ACTIONS = [
  { icon: "📄", label: "Summarize",  sublabel: "Documents" },
  { icon: "💡", label: "Brainstorm", sublabel: "Ideas"     },
  { icon: "📊", label: "Analyze",    sublabel: "Data"      },
  { icon: "✏️", label: "Write",      sublabel: "Content"   },
];

function timeLabel(dateStr: string) {
  const d    = new Date(dateStr);
  const now  = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (diff === 0) return "Today, " + time;
  if (diff === 1) return "Yesterday, " + time;
  if (diff < 30)  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ChatPage() {
  const { accessToken, user } = useUserStore();
  const router       = useRouter();
  const queryClient  = useQueryClient();
  const name         = user?.username ?? "there";

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn:  () => conversationService.list(accessToken!),
    enabled:  !!accessToken,
  });

  const createChat = useMutation({
    mutationFn: () => conversationService.create({ title: "New Chat" }, accessToken!),
    onSuccess:  (c) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      router.push(`/chat/${c.id}`);
    },
  });

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full px-5 pt-6 pb-8 max-w-2xl mx-auto w-full">

        {/* ── Greeting ── */}
        <div className="mb-6 animate-fade-up">
          {/* Gold orb decoration */}
          <div
            className="absolute top-16 right-0 pointer-events-none"
            style={{
              width: 120, height: 120,
              background: "radial-gradient(circle, rgba(212,146,14,0.25) 0%, transparent 70%)",
              borderRadius: "50%",
              filter: "blur(8px)",
            }}
          />
          <h1 className="text-title font-black text-foreground" style={{ lineHeight: 1.2 }}>
            Welcome back,<br />
            <span>{name}.</span>
          </h1>
          <p className="text-caption text-muted-foreground mt-1.5">
            How can I assist you today?
          </p>
        </div>

        {/* ── Search / Ask bar ── */}
        <div
          className="input-pill mb-7 animate-fade-up cursor-text"
          style={{ animationDelay: "50ms" }}
          onClick={() => createChat.mutate()}
        >
          <span className="flex-1 text-body text-muted-foreground select-none">
            Ask anything…
          </span>
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Voice"
          >
            <Mic size={17} strokeWidth={1.8} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); createChat.mutate(); }}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-all active:scale-90"
            style={{
              background: "linear-gradient(135deg, #D4920E, #C17D0A)",
              boxShadow: "0 2px 10px rgba(193,125,10,0.4)",
            }}
            aria-label="Send"
          >
            <ArrowUp size={17} strokeWidth={2.5} />
          </button>
        </div>

        {/* ── Quick Actions ── */}
        <div className="mb-7 animate-fade-up" style={{ animationDelay: "90ms" }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-heading font-bold text-foreground">Quick Actions</h2>
            <button className="flex items-center gap-0.5 text-caption font-semibold gold-text">
              See all <ChevronRight size={13} />
            </button>
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            {QUICK_ACTIONS.map(({ icon, label, sublabel }) => (
              <button
                key={label}
                onClick={() => createChat.mutate()}
                className="quick-chip flex-shrink-0"
                style={{ minWidth: 82 }}
              >
                <span style={{ fontSize: "1.35rem" }}>{icon}</span>
                <span className="text-caption font-semibold text-foreground">{label}</span>
                <span className="text-micro text-muted-foreground">{sublabel}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Recent Chats ── */}
        <div className="animate-fade-up flex-1" style={{ animationDelay: "130ms" }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-heading font-bold text-foreground">Recent Chats</h2>
            <button className="flex items-center gap-0.5 text-caption font-semibold gold-text">
              See all <ChevronRight size={13} />
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-2.5">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: "var(--card)" }} />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-4 text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "var(--pyro-gold-pale)", border: "1px solid rgba(193,125,10,0.2)" }}
              >
                <MessageSquare size={26} className="gold-text" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-heading font-bold text-foreground">No chats yet</p>
                <p className="text-caption text-muted-foreground mt-1 max-w-xs">
                  Start a conversation — Pyrobot is ready.
                </p>
              </div>
              <button
                onClick={() => createChat.mutate()}
                className="px-6 py-3 rounded-2xl font-bold text-white text-caption"
                style={{ background: "linear-gradient(135deg, #D4920E, #C17D0A)", boxShadow: "0 3px 12px rgba(193,125,10,0.4)" }}
              >
                Start chatting
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {conversations.slice(0, 6).map((c: Conversation) => (
                <button
                  key={c.id}
                  onClick={() => router.push(`/chat/${c.id}`)}
                  className="convo-row w-full text-left"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-body font-semibold text-foreground truncate">{c.title}</p>
                    <p className="text-micro text-muted-foreground mt-0.5">
                      {timeLabel(c.updated_at || c.created_at)}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
