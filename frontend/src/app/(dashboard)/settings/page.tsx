"use client";
import {
  ChevronRight, User, Database, Puzzle, Shield,
  HelpCircle, Crown, LogOut
} from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { useLogout } from "@/hooks/useAuth";
import { PageTransition } from "@/components/providers/PageTransition";
import { FlameIcon } from "@/components/ui/FlameLogo";

const SETTINGS_ROWS = [
  {
    icon: User,
    label: "Personalization",
    sublabel: "Customize your AI experience",
    href: "#",
  },
  {
    icon: Database,
    label: "Memory",
    sublabel: "Manage what Pyrobot remembers",
    href: "/memories",
  },
  {
    icon: Puzzle,
    label: "Integrations",
    sublabel: "Connect your favourite tools",
    href: "#",
  },
  {
    icon: Shield,
    label: "Security & Privacy",
    sublabel: "Your data is always protected",
    href: "#",
  },
  {
    icon: HelpCircle,
    label: "Help & Support",
    sublabel: "We're here to help you",
    href: "#",
  },
];

export default function SettingsPage() {
  const { user }  = useUserStore();
  const logout    = useLogout();
  const initials  = user?.username?.[0]?.toUpperCase() ?? "?";

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full pb-8 max-w-2xl mx-auto w-full px-4 pt-5">

        {/* ── Profile card ── */}
        <div
          className="rounded-2xl p-4 mb-4 animate-fade-up flex items-center gap-4"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          {/* Avatar — flame logo in dark circle */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "#1A1208", border: "1.5px solid rgba(212,146,14,0.3)" }}
          >
            <FlameIcon size={38} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-heading font-bold text-foreground truncate">
                {user?.username ?? "Pyrobot"}
              </p>
              {/* Pro badge */}
              <span
                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-micro font-bold text-white"
                style={{ background: "linear-gradient(135deg, #D4920E, #C17D0A)", fontSize: "0.65rem" }}
              >
                ⭐ Pro
              </span>
            </div>
            <p className="text-micro text-muted-foreground truncate">
              {user?.email ?? "pyrobot@ai.com"}
            </p>
            <p className="text-micro text-muted-foreground mt-0.5">
              Advanced AI. Personalized for you.
            </p>
          </div>

          <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />
        </div>

        {/* ── Pro card ── */}
        <div
          className="rounded-2xl p-4 mb-5 flex items-center gap-3 animate-fade-up"
          style={{
            background: "linear-gradient(135deg, #2A1E04, #1E1608)",
            border: "1px solid rgba(212,146,14,0.25)",
            animationDelay: "50ms",
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(212,146,14,0.2)", border: "1px solid rgba(212,146,14,0.35)" }}
          >
            <Crown size={20} style={{ color: "#D4920E" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-caption font-bold text-foreground">Pyrobot Pro</p>
            <p className="text-micro text-muted-foreground">Unlock advanced features and priority access.</p>
          </div>
          <span
            className="flex items-center gap-1 px-3 py-1 rounded-lg text-micro font-bold"
            style={{ background: "rgba(212,146,14,0.15)", color: "#D4920E", border: "1px solid rgba(212,146,14,0.3)" }}
          >
            ✓ Active
          </span>
        </div>

        {/* ── Settings rows ── */}
        <div className="space-y-2.5 animate-fade-up" style={{ animationDelay: "90ms" }}>
          {SETTINGS_ROWS.map(({ icon: Icon, label, sublabel, href }) => (
            <a
              key={label}
              href={href}
              className="flex items-center gap-3.5 w-full p-4 rounded-2xl transition-all"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                textDecoration: "none",
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--muted)", border: "1px solid var(--border)" }}
              >
                <Icon size={17} className="text-muted-foreground" strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-body font-semibold text-foreground">{label}</p>
                <p className="text-micro text-muted-foreground mt-0.5">{sublabel}</p>
              </div>
              <ChevronRight size={15} className="text-muted-foreground flex-shrink-0" />
            </a>
          ))}
        </div>

        {/* ── Sign out ── */}
        <button
          onClick={logout}
          className="mt-6 w-full py-4 rounded-2xl font-semibold text-destructive transition-all active:scale-97"
          style={{
            background: "rgba(220,38,38,0.05)",
            border: "1px solid rgba(220,38,38,0.12)",
          }}
        >
          <LogOut size={16} className="inline mr-2 -mt-0.5" />
          Sign Out
        </button>
      </div>
    </PageTransition>
  );
}
