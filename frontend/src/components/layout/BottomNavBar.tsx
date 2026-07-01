"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, History, User } from "lucide-react";
import { FlameLogo } from "@/components/ui/FlameLogo";
import type { LucideIcon } from "lucide-react";

const LEFT_NAV  = [
  { href: "/chat",      icon: Home,    label: "Home"    },
  { href: "/explore",   icon: Compass, label: "Explore" },
] as const;
const RIGHT_NAV = [
  { href: "/memories",  icon: History, label: "History" },
  { href: "/settings",  icon: User,    label: "Profile" },
] as const;

export function BottomNavBar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 glass-dark border-t border-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 8px)" }}
    >
      <div className="flex items-end justify-around px-2 pt-2 pb-2 max-w-lg mx-auto">
        {LEFT_NAV.map(({ href, icon, label }) => (
          <NavItem key={href} href={href} icon={icon} label={label} active={isActive(href)} />
        ))}

        {/* Centre FAB — gold P logo raised */}
        <Link
          href="/chat"
          className="nav-fab gold-gradient flex-shrink-0"
          aria-label="New chat"
          style={{
            width: 52, height: 52,
            borderRadius: 18,
            marginTop: -18,
            boxShadow: "0 0 28px rgba(245,158,11,0.5), 0 6px 18px rgba(0,0,0,0.6)",
          }}
        >
          <FlameLogo size={36} className="pointer-events-none" />
        </Link>

        {RIGHT_NAV.map(({ href, icon, label }) => (
          <NavItem key={href} href={href} icon={icon} label={label} active={isActive(href)} />
        ))}
      </div>
    </nav>
  );
}

function NavItem({
  href, icon: Icon, label, active,
}: {
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
      <span className="nav-item-label" style={{ fontWeight: active ? 600 : 400 }}>
        {label}
      </span>
    </Link>
  );
}
