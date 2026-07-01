"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  MessageSquare, PenLine, FileText, Lightbulb,
  Calendar, Languages, ChevronRight, Star, Plus, Mic
} from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { conversationService } from "@/services/conversation-service";
import { PageTransition } from "@/components/providers/PageTransition";
import type { Conversation } from "@/types/chat.types";

const QUICK_ACTIONS = [
  { icon: MessageSquare, label: "Chat with AI",  emoji: "💬" },
  { icon: PenLine,       label: "Write",          emoji: "✏️" },
  { icon: FileText,      label: "Summarize",      emoji: "📄" },
  { icon: Lightbulb,     label: "Brainstorm",     emoji: "💡" },
  { icon: Calendar,      label: "Plan",            emoji: "📅" },
  { icon: Languages,     label: "Translate",       emoji: "🌐" },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function timeLabel(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return "Today, " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7)  return `${diffDays} days ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Emoji icon per conversation (cycles by index)
const CONVO_EMOJIS = ["🗓️", "💡", "📚", "💪", "🎯", "🛠️", "🌍", "✨"];

export default function ChatPage() {
  const { accessToken, user } = useUserStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => conversationService.list(accessToken!),
    enabled: !!accessToken,
  });

  const createConversation = useMutation({
    mutationFn: () => conversationService.create({ title: "New Chat" }, accessToken!),
    onSuccess: (c) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      router.push(`/chat/${c.id}`);
    },
  });

  const name = user?.username ?? "there";
  const greeting = `${getGreeting()}, ${name}! 👋`;

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full px-4 pt-6 pb-8 max-w-2xl mx-auto w-full">

        {/* ── Greeting ── */}
        <div className="mb-6 animate-fade-up">
          <h1 className="text-title font-black text-foreground" style={{ fontSize: "1.5rem" }}>
            {greeting}
          </h1>
          <p className="text-caption text-muted-foreground mt-0.5">
            What shall we tackle today?
          </p>
        </div>

        {/* ── Search / Ask bar ── */}
        <button
          onClick={() => createConversation.mutate()}
          disabled={createConversation.isPending}
          className="home-input-box w-full mb-6 animate-fade-up text-left"
          style={{ animationDelay: "60ms" }}
        >
          <span className="flex-1 text-body text-muted-foreground">Ask me anything…</span>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 gold-gradient gold-glow"
          >
            <Mic size={18} className="text-black" strokeWidth={2} />
          </div>
        </button>

        {/* ── Quick Actions ── */}
        <div className="mb-7 animate-fade-up" style={{ animationDelay: "100ms" }}>
          <div className="grid grid-cols-3 gap-2.5">
            {QUICK_ACTIONS.map(({ emoji, label }) => (
              <button
                key={label}
                onClick={() => createConversation.mutate()}
                className="quick-chip flex-col py-3 h-auto gap-1.5 justify-center w-full"
                style={{ borderRadius: 16 }}
              >
                <span style={{ fontSize: "1.3rem" }}>{emoji}</span>
                <span className="text-caption font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Recent Chats ── */}
        <div className="animate-fade-up" style={{ animationDelay: "160ms" }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-heading font-bold text-foreground">Recent Chats</h2>
            <button className="flex items-center gap-0.5 text-caption text-gold font-semibold">
              See all <ChevronRight size={14} />
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-2.5">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className="h-16 rounded-2xl animate-pulse"
                  style={{ background: "var(--card)" }}
                />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}
              >
                <MessageSquare size={28} className="gold-text" strokeWidth={1.5} />
              </div>
              <p className="text-heading font-semibold text-foreground">No chats yet</p>
              <p className="text-caption text-muted-foreground text-center max-w-xs">
                Start a conversation and Pyrobot will remember it here.
              </p>
              <button
                onClick={() => createConversation.mutate()}
                className="mt-1 px-6 py-3 rounded-2xl font-bold text-black gold-gradient gold-glow text-caption"
              >
                Start your first chat
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.slice(0, 6).map((c: Conversation, i: number) => (
                <button
                  key={c.id}
                  onClick={() => router.push(`/chat/${c.id}`)}
                  className="convo-item w-full text-left"
                >
                  {/* Emoji icon */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                    style={{ background: "var(--muted)", border: "1px solid var(--border)" }}
                  >
                    {CONVO_EMOJIS[i % CONVO_EMOJIS.length]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-body font-semibold text-foreground truncate">{c.title}</p>
                    {c.last_message && (
                      <p className="text-micro text-muted-foreground truncate mt-0.5">{c.last_message}</p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
                    <p className="text-micro text-muted-foreground whitespace-nowrap">
                      {timeLabel(c.updated_at || c.created_at)}
                    </p>
                    <Star size={13} className="text-muted-foreground opacity-40" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── New Chat FAB (floating, for scroll state) ── */}
        <div className="fixed bottom-24 right-5 z-40">
          <button
            onClick={() => createConversation.mutate()}
            disabled={createConversation.isPending}
            className="w-13 h-13 rounded-2xl gold-gradient gold-glow flex items-center justify-center transition-all active:scale-95"
            style={{ width: 52, height: 52, borderRadius: 16 }}
            aria-label="New chat"
          >
            <Plus size={22} className="text-black" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </PageTransition>
  );
}
