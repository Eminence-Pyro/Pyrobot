"use client";
import { SquarePen } from "lucide-react";
import Link from "next/link";

interface TopBarProps {
  title?: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  showEditButton?: boolean;
}

export function TopBar({ title = "PYROBOT", leftSlot, rightSlot, showEditButton = true }: TopBarProps) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 glass-topbar"
      style={{ height: 56 }}
    >
      {/* Left slot */}
      <div className="w-10 flex items-center">
        {leftSlot ?? (
          <button
            className="w-9 h-9 flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors"
            aria-label="Menu"
          >
            {/* Hamburger — 3 lines */}
            <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
              <rect x="0" y="0"  width="20" height="2" rx="1" fill="currentColor"/>
              <rect x="0" y="6"  width="14" height="2" rx="1" fill="currentColor"/>
              <rect x="0" y="12" width="20" height="2" rx="1" fill="currentColor"/>
            </svg>
          </button>
        )}
      </div>

      {/* Centre wordmark */}
      <h1
        className="font-black tracking-widest uppercase"
        style={{ fontSize: "1rem", letterSpacing: "0.18em", color: "var(--foreground)" }}
      >
        {title}
      </h1>

      {/* Right slot */}
      <div className="w-10 flex items-center justify-end">
        {rightSlot ?? (
          showEditButton ? (
            <Link
              href="/chat/new"
              className="w-9 h-9 flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors"
              aria-label="New chat"
            >
              <SquarePen size={19} strokeWidth={1.8} />
            </Link>
          ) : null
        )}
      </div>
    </header>
  );
}
