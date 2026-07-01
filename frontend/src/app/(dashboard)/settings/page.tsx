"use client";
import { useState } from "react";
import { ChevronRight, Check, User, Ruler, MessageSquare, Database } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { useLogout } from "@/hooks/useAuth";
import { PageTransition } from "@/components/providers/PageTransition";

type Tab = "Tools" | "AI Models" | "Customize";

const AI_MODELS = [
  { id: "gpt4o",   name: "GPT-4o",       desc: "Smart, versatile, and perfect for most tasks.", badge: "👑", color: "#F59E0B", accent: "rgba(245,158,11,0.15)" },
  { id: "claude",  name: "Claude 3.5",   desc: "Great for writing and reasoning.",              badge: "✦",  color: "#8B5CF6", accent: "rgba(139,92,246,0.1)"  },
  { id: "gemini",  name: "Gemini 1.5 Pro",desc: "Daily 60–90 mins to learn something new.",    badge: null, color: "#3B82F6", accent: "rgba(59,130,246,0.1)"  },
  { id: "perplx",  name: "Perplexity",   desc: "Real-time info and web search.",               badge: "✦",  color: "#06B6D4", accent: "rgba(6,182,212,0.1)"   },
];

const CUSTOMIZE = [
  { icon: User,         label: "Personality",      value: "Balanced"  },
  { icon: Ruler,        label: "Response Length",   value: "Detailed"  },
  { icon: MessageSquare,label: "Tone",              value: "Friendly"  },
  { icon: Database,     label: "Memory",            value: "On"        },
];

const TABS: Tab[] = ["Tools", "AI Models", "Customize"];

export default function SettingsPage() {
  const { user } = useUserStore();
  const logout   = useLogout();
  const [tab, setTab]         = useState<Tab>("Tools");
  const [activeModel, setModel] = useState("gpt4o");
  const initials = user?.username?.[0]?.toUpperCase() ?? "?";

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full pb-8 max-w-2xl mx-auto w-full">

        {/* ── Profile card ── */}
        <div className="px-4 pt-6 pb-4 animate-fade-up">
          <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-black font-black text-xl gold-glow"
              style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)" }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-heading font-bold text-foreground truncate">{user?.username ?? "User"}</p>
              <p className="text-caption text-muted-foreground truncate">{user?.email ?? ""}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className="text-micro px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: "rgba(245,158,11,0.15)", color: "var(--pyro-gold)" }}
                >
                  ✦ Pro
                </span>
              </div>
            </div>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="px-4 mb-5 animate-fade-up" style={{ animationDelay: "60ms" }}>
          <div
            className="flex rounded-xl p-1 gap-1"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-2 rounded-lg text-caption font-semibold transition-all"
                style={{
                  background: tab === t ? "var(--pyro-gold)" : "transparent",
                  color:      tab === t ? "#000"             : "var(--muted-foreground)",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab: AI Models ── */}
        {tab === "AI Models" && (
          <div className="px-4 space-y-4 animate-fade-up">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-heading font-bold text-foreground">AI Models</h2>
              <button className="text-caption text-gold font-semibold flex items-center gap-0.5">
                Manage <ChevronRight size={13} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {AI_MODELS.map(m => {
                const isActive = activeModel === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setModel(m.id)}
                    className="relative text-left p-4 rounded-2xl transition-all"
                    style={{
                      background: isActive ? m.accent : "var(--card)",
                      border: `1.5px solid ${isActive ? m.color : "var(--border)"}`,
                    }}
                  >
                    {isActive && (
                      <div
                        className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: m.color }}
                      >
                        <Check size={11} className="text-black" strokeWidth={3} />
                      </div>
                    )}
                    {m.badge && (
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-lg"
                        style={{ background: m.accent, border: `1px solid ${m.color}30` }}
                      >
                        {m.badge}
                      </div>
                    )}
                    <p className="text-caption font-bold text-foreground">{m.name}</p>
                    <p className="text-micro text-muted-foreground mt-0.5 leading-relaxed">{m.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Tab: Customize ── */}
        {tab === "Customize" && (
          <div className="px-4 space-y-3 animate-fade-up">
            <h2 className="text-heading font-bold text-foreground mb-3">Customization</h2>
            {CUSTOMIZE.map(({ icon: Icon, label, value }) => (
              <button
                key={label}
                className="flex items-center gap-3 w-full p-4 rounded-2xl text-left transition-all"
                style={{ background: "var(--card)", border: "1px solid var(--border)" }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}
                >
                  <Icon size={17} className="gold-text" />
                </div>
                <span className="flex-1 text-body font-medium text-foreground">{label}</span>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <span className="text-caption">{value}</span>
                  <ChevronRight size={15} />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── Tab: Tools ── */}
        {tab === "Tools" && (
          <div className="px-4 space-y-3 animate-fade-up">
            <h2 className="text-heading font-bold text-foreground mb-3">Tools & Account</h2>
            {[
              { label: "Edit Profile",        value: user?.username ?? "" },
              { label: "Notification Settings",value: "On" },
              { label: "Language",            value: "English" },
              { label: "App Appearance",      value: "Dark" },
              { label: "Privacy & Data",      value: "" },
            ].map(({ label, value }) => (
              <button
                key={label}
                className="flex items-center gap-3 w-full p-4 rounded-2xl text-left"
                style={{ background: "var(--card)", border: "1px solid var(--border)" }}
              >
                <span className="flex-1 text-body font-medium text-foreground">{label}</span>
                <div className="flex items-center gap-1 text-muted-foreground">
                  {value && <span className="text-caption">{value}</span>}
                  <ChevronRight size={15} />
                </div>
              </button>
            ))}

            <button
              onClick={logout}
              className="w-full p-4 rounded-2xl text-center font-semibold text-destructive transition-all"
              style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
