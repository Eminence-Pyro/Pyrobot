"use client";
import { Menu } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { FlameLogo } from "@/components/ui/FlameLogo";

interface TopBarProps {
  title?: string;
  subtitle?: string;
  showMenu?: boolean;
  onMenuClick?: () => void;
  rightSlot?: React.ReactNode;
}

export function TopBar({
  title,
  subtitle,
  showMenu = false,
  onMenuClick,
  rightSlot,
}: TopBarProps) {
  const { user } = useUserStore();
  const initials = user?.username?.[0]?.toUpperCase() ?? "?";

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 glass-dark border-b border-border"
      style={{ height: 60 }}
    >
      {/* Left: menu icon OR logo+wordmark */}
      {showMenu ? (
        <button
          onClick={onMenuClick}
          className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Menu"
        >
          <Menu size={22} />
        </button>
      ) : (
        <div className="flex items-center gap-2.5">
          <FlameLogo size={30} />
          <div className="flex flex-col leading-none">
            <span className="text-heading font-bold text-foreground tracking-tight" style={{ fontSize: "1rem" }}>
              Pyrobot <span className="gold-gradient-text" style={{ fontSize: "0.75rem" }}>✦</span>
            </span>
            <span className="text-micro text-muted-foreground">Your AI Assistant</span>
          </div>
        </div>
      )}

      {/* Center title (optional) */}
      {title && (
        <div className="absolute left-1/2 -translate-x-1/2 text-center">
          <p className="text-heading font-semibold text-foreground">{title}</p>
          {subtitle && <p className="text-micro text-muted-foreground">{subtitle}</p>}
        </div>
      )}

      {/* Right: custom slot or avatar */}
      <div className="flex items-center gap-2">
        {rightSlot}
        {user && (
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-black font-bold text-caption gold-glow"
            style={{
              background: "linear-gradient(135deg, #F59E0B, #D97706)",
              fontSize: "0.875rem",
            }}
            aria-label={user.username}
          >
            {initials}
          </div>
        )}
      </div>
    </header>
  );
}
