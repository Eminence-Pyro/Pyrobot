"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, History, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const LEFT_ITEMS  = [
  { href: "/chat",     icon: Home,    label: "Home"    },
  { href: "/explore",  icon: Compass, label: "Explore" },
] as const;
const RIGHT_ITEMS = [
  { href: "/memories", icon: History, label: "History" },
  { href: "/settings", icon: User,    label: "Profile" },
] as const;

export function BottomNavBar() {
  const pathname = usePathname();
  const active   = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 glass-bar border-t"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 8px)" }}
    >
      <div className="flex items-end justify-around px-2 pt-1.5 pb-1.5 max-w-lg mx-auto">
        {LEFT_ITEMS.map(item => (
          <NavItem key={item.href} {...item} active={active(item.href)} />
        ))}

        {/* Centre ✦ FAB — raised, gold glow */}
        <Link
          href="/chat"
          aria-label="New conversation"
          className="flex items-center justify-center rounded-[18px] gold-gradient gold-glow text-black font-black transition-all active:scale-90 animate-pulse-gold flex-shrink-0"
          style={{
            width: 52, height: 52,
            marginTop: -20,
            fontSize: "1.5rem",
            lineHeight: 1,
          }}
        >
          ✦
        </Link>

        {RIGHT_ITEMS.map(item => (
          <NavItem key={item.href} {...item} active={active(item.href)} />
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
      className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all min-w-[52px]"
      style={{
        color: active ? "var(--pyro-gold)" : "var(--muted-foreground)",
        transition: "color var(--animate-fast)",
      }}
    >
      <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
      <span className="nav-label" style={{ fontWeight: active ? 600 : 400 }}>{label}</span>
    </Link>
  );
}
