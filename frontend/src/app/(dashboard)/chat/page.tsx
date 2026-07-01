"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ChevronRight, Plus, Mic, Star, MessageSquare } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { conversationService } from "@/services/conversation-service";
import { PageTransition } from "@/components/providers/PageTransition";
import type { Conversation } from "@/types/chat.types";

/* ── Quick action chips — 6 items, 2 rows of 3 (mockup 1) ── */
const CHIPS = [
  { emoji:"💬", label:"Chat with AI"  },
  { emoji:"✏️", label:"Write"        },
  { emoji:"📄", label:"Summarize"    },
  { emoji:"💡", label:"Brainstorm"   },
  { emoji:"📅", label:"Plan"         },
  { emoji:"🌐", label:"Translate"    },
];

/* ── Rotating emoji per convo ── */
const CONVO_EMOJI = ["🗓️","💡","📚","💪","🎯","🛠️","🌍","✨","🔬","🎨"];

function relTime(d: string) {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (diff === 0) return "Today, " + new Date(d).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"});
  if (diff === 1) return "Yesterday";
  if (diff < 7)  return `${diff} days ago`;
  return new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric"});
}

export default function ChatPage() {
  const { accessToken, user } = useUserStore();
  const router       = useRouter();
  const queryClient  = useQueryClient();
  const name         = user?.username ?? "there";
  const hour         = new Date().getHours();
  const greeting     = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn:  () => conversationService.list(accessToken!),
    enabled:  !!accessToken,
  });

  const newChat = useMutation({
    mutationFn: () => conversationService.create({ title:"New Chat" }, accessToken!),
    onSuccess:  (c) => {
      queryClient.invalidateQueries({ queryKey:["conversations"] });
      router.push(`/chat/${c.id}`);
    },
  });

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full px-4 pt-5 pb-6 max-w-2xl mx-auto w-full">

        {/* ── Greeting ── */}
        <div className="mb-5 animate-fade-up">
          <h1 className="text-title font-black text-foreground" style={{lineHeight:1.15}}>
            {greeting}, {name}!{" "}
            <span role="img" aria-label="wave">👋</span>
          </h1>
          <p className="text-caption text-muted-foreground mt-1">
            What shall we tackle today?
          </p>
        </div>

        {/* ── Search/Ask bar ── */}
        <button
          className="input-pill w-full mb-6 text-left animate-fade-up"
          style={{ animationDelay:"50ms" }}
          onClick={() => newChat.mutate()}
          disabled={newChat.isPending}
        >
          <span className="flex-1 text-body text-muted-foreground select-none">
            Ask me anything…
          </span>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 gold-gradient"
            style={{boxShadow:"0 2px 10px rgba(245,158,11,0.4)"}}
          >
            <Mic size={18} className="text-black" strokeWidth={2}/>
          </div>
        </button>

        {/* ── Quick Actions — 2×3 chip grid ── */}
        <div className="mb-6 animate-fade-up" style={{animationDelay:"90ms"}}>
          <div className="grid grid-cols-3 gap-2">
            {CHIPS.map(({ emoji, label }) => (
              <button
                key={label}
                onClick={() => newChat.mutate()}
                className="quick-chip flex-col py-3 gap-1.5 w-full justify-center h-auto"
                style={{borderRadius:14}}
              >
                <span style={{fontSize:"1.25rem"}}>{emoji}</span>
                <span className="text-micro font-semibold leading-tight text-center">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Recent Chats ── */}
        <div className="flex-1 animate-fade-up" style={{animationDelay:"130ms"}}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-heading font-bold text-foreground">Recent Chats</h2>
            <button className="flex items-center gap-0.5 text-caption font-semibold gold-text">
              See all <ChevronRight size={13}/>
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1,2,3].map(i=>(
                <div key={i} className="h-[68px] rounded-2xl animate-pulse" style={{background:"var(--pyro-surface-1)"}}/>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{background:"var(--pyro-gold-pale)",border:"1px solid rgba(245,158,11,0.2)"}}>
                <MessageSquare size={28} className="gold-text" strokeWidth={1.5}/>
              </div>
              <div>
                <p className="text-heading font-bold text-foreground">No chats yet</p>
                <p className="text-caption text-muted-foreground mt-1 max-w-[240px]">
                  Tap a quick action above or start a new conversation.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.slice(0,6).map((c:Conversation,i:number)=>(
                <button key={c.id} onClick={()=>router.push(`/chat/${c.id}`)}
                  className="convo-row w-full text-left"
                >
                  {/* Emoji avatar */}
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                    style={{background:"var(--pyro-surface-2)",border:"1px solid var(--border)"}}>
                    {CONVO_EMOJI[i % CONVO_EMOJI.length]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body font-semibold text-foreground truncate">{c.title}</p>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-end gap-1">
                    <span className="text-micro text-muted-foreground whitespace-nowrap">
                      {relTime(c.updated_at || c.created_at)}
                    </span>
                    <Star size={12} className="text-muted-foreground opacity-40"/>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Floating + button (visible when list is scrolled) */}
        <button
          onClick={() => newChat.mutate()}
          disabled={newChat.isPending}
          className="fixed bottom-24 right-4 z-40 w-12 h-12 rounded-2xl gold-gradient gold-glow flex items-center justify-center transition-all active:scale-90"
          aria-label="New chat"
        >
          <Plus size={22} className="text-black" strokeWidth={2.5}/>
        </button>
      </div>
    </PageTransition>
  );
}
