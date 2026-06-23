'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { useLogout } from '@/hooks/useAuth';

export function TopBar() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { user } = useUserStore();
  const logout = useLogout();

  const ThemeIcon =
    resolvedTheme === 'dark' ? Moon
    : resolvedTheme === 'light' ? Sun
    : Monitor;

  const cycleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

  // First letter of username, uppercase
  const initials = user?.username?.[0]?.toUpperCase() ?? '?';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-4 glass-dark border-b border-border">
      {/* Logo + wordmark */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gold flex items-center justify-center shadow-sm">
          <span className="text-micro font-bold text-white leading-none">P</span>
        </div>
        <span className="text-heading font-bold text-foreground tracking-tight">
          Pyrobot{' '}
          <span className="text-gold" aria-hidden="true">✦</span>
        </span>
      </div>

      {/* Right side: theme toggle + user avatar */}
      <div className="flex items-center gap-2">
        <button
          onClick={cycleTheme}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-gold hover:bg-gold/10 transition-all"
          style={{ transition: 'var(--animate-fast)' }}
          aria-label={`Switch theme (current: ${theme ?? 'system'})`}
        >
          <ThemeIcon size={18} />
        </button>

        {/* User avatar — tap to log out */}
        {user && (
          <button
            onClick={logout}
            className="w-9 h-9 rounded-full bg-gold flex items-center justify-center text-white text-caption font-bold hover:opacity-80 transition-opacity"
            aria-label={`Logged in as ${user.username}. Tap to sign out.`}
            title={`Sign out (${user.username})`}
          >
            {initials}
          </button>
        )}
      </div>
    </header>
  );
}