"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const LEFT_NAV  = [
  { href: "/chat",     icon: Home,           label: "Home"    },
  { href: "/messages", icon: MessageSquare,  label: "Chat"    },
] as const;

const RIGHT_NAV = [
  { href: "/settings", icon: User,           label: "Profile" },
] as const;

/* 4-dot grid icon for Explore FAB — matches mockup 2 */
function GridIcon({ size = 20 }: { size?: number }) {
  const d = size * 0.4;
  const g = size * 0.13;
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="2"  y="2"  width={d} height={d} rx="2" fill="currentColor"/>
      <rect x="11" y="2"  width={d} height={d} rx="2" fill="currentColor"/>
      <rect x="2"  y="11" width={d} height={d} rx="2" fill="currentColor"/>
      <rect x="11" y="11" width={d} height={d} rx="2" fill="currentColor"/>
    </svg>
  );
}

export function BottomNavBar() {
  const pathname  = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 glass-bottom"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 8px)" }}
    >
      <div
        className="flex items-center justify-around px-4 max-w-lg mx-auto"
        style={{ height: 60 }}
      >
        {LEFT_NAV.map(({ href, icon, label }) => (
          <NavItem key={href} href={href} icon={icon} label={label} active={isActive(href)} />
        ))}

        {/* Centre FAB — gold circle with grid icon */}
        <Link
          href="/explore"
          aria-label="Explore tools"
          className="flex items-center justify-center rounded-full transition-all active:scale-90"
          style={{
            width: 50, height: 50,
            background: "linear-gradient(135deg, #D4920E, #C17D0A)",
            boxShadow: "0 0 20px rgba(193,125,10,0.5), 0 4px 12px rgba(0,0,0,0.2)",
            color: "#fff",
          }}
        >
          <GridIcon size={22} />
        </Link>

        {RIGHT_NAV.map(({ href, icon, label }) => (
          <NavItem key={href} href={href} icon={icon} label={label} active={isActive(href)} />
        ))}
      </div>
    </nav>
  );
}

function NavItem({ href, icon: Icon, label, active }: {
  href: string; icon: LucideIcon; label: string; active: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all"
      style={{
        color: active ? "var(--pyro-gold)" : "var(--muted-foreground)",
        transition: "color var(--animate-fast)",
        minWidth: 52,
      }}
    >
      <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
      <span className="nav-item-label" style={{ fontWeight: active ? 600 : 400 }}>{label}</span>
    </Link>
  );
}
