"use client";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useUserStore } from "@/store/userStore";
import { useLogout } from "@/hooks/useAuth";
import { FlameLogo } from "@/components/ui/FlameLogo";

interface TopBarProps {
  /** Optional left element — replaces logo (e.g. back button in chat) */
  leftSlot?: React.ReactNode;
  /** Optional right element — replaces avatar */
  rightSlot?: React.ReactNode;
  /** Override centre title */
  title?: string;
  subtitle?: string;
}

export function TopBar({ leftSlot, rightSlot, title, subtitle }: TopBarProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const { user } = useUserStore();
  const logout   = useLogout();
  const initials = user?.username?.[0]?.toUpperCase() ?? "?";
  const isDark   = resolvedTheme === "dark";

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-[60px] flex items-center justify-between px-4 glass-bar border-b"
    >
      {/* Left */}
      <div className="flex items-center gap-2.5 min-w-0">
        {leftSlot ?? (
          <>
            <FlameLogo size={32} showSparkle />
            <div className="flex flex-col leading-none">
              <span className="text-heading font-black tracking-tight text-foreground">
                Pyrobot{" "}
                <span className="gold-gradient-text text-xs align-super">✦</span>
              </span>
              <span className="text-micro text-muted-foreground">Your AI Assistant</span>
            </div>
          </>
        )}
      </div>

      {/* Centre (chat uses this for conversation title) */}
      {title && (
        <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none">
          <p className="text-heading font-semibold text-foreground truncate max-w-[180px]">{title}</p>
          {subtitle && <p className="text-micro text-muted-foreground">{subtitle}</p>}
        </div>
      )}

      {/* Right */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {rightSlot ?? (
          <>
            {/* Dark/light toggle */}
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-gold transition-colors"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark
                ? <Sun  size={17} strokeWidth={1.8} />
                : <Moon size={17} strokeWidth={1.8} />}
            </button>

            {/* User avatar / logout */}
            {user && (
              <button
                onClick={logout}
                className="w-9 h-9 rounded-full flex items-center justify-center text-black font-bold text-caption gold-gradient gold-glow"
                aria-label={`Signed in as ${user.username}. Tap to sign out.`}
                title="Sign out"
              >
                {initials}
              </button>
            )}
          </>
        )}
      </div>
    </header>
  );
}
