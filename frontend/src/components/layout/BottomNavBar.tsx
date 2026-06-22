'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, Brain, Settings, Plus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const LEFT_NAV = [
  { href: '/chat',     icon: MessageSquare, label: 'Chat'     },
] as const;

const RIGHT_NAV = [
  { href: '/memories', icon: Brain,         label: 'Memory'   },
  { href: '/settings', icon: Settings,      label: 'Settings' },
] as const;

export function BottomNavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-dark border-t border-border">
      <div className="flex items-center justify-around px-2 pt-2 pb-3">
        {/* Left nav item */}
        {LEFT_NAV.map(({ href, icon, label }) => (
          <NavItem
            key={href}
            href={href}
            icon={icon}
            label={label}
            active={pathname === href || pathname.startsWith(href + '/')}
          />
        ))}

        {/* Center FAB — new chat / primary action */}
        <Link
          href="/chat"
          className="w-12 h-12 rounded-2xl bg-gold flex items-center justify-center glow-gold active:scale-95"
          style={{ transition: 'var(--animate-spring)' }}
          aria-label="New chat"
        >
          <Plus size={22} className="text-white" strokeWidth={2.5} />
        </Link>

        {/* Right nav items */}
        {RIGHT_NAV.map(({ href, icon, label }) => (
          <NavItem
            key={href}
            href={href}
            icon={icon}
            label={label}
            active={pathname === href}
          />
        ))}
      </div>
    </nav>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all ${
        active
          ? 'text-gold'
          : 'text-muted-foreground hover:text-foreground'
      }`}
      style={{ transition: 'var(--animate-fast)' }}
    >
      <Icon size={22} strokeWidth={active ? 2.5 : 2} />
      <span
        className="text-micro font-medium"
        style={{ fontWeight: active ? 600 : 400 }}
      >
        {label}
      </span>
    </Link>
  );
}