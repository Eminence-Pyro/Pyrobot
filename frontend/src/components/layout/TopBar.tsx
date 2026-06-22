'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';

export function TopBar() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const ThemeIcon =
    resolvedTheme === 'dark' ? Moon
    : resolvedTheme === 'light' ? Sun
    : Monitor;

  const cycleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-4 glass-dark border-b border-border">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gold flex items-center justify-center shadow-sm">
          <span className="text-micro font-bold text-white leading-none">P</span>
        </div>
        <span className="text-heading font-bold text-foreground tracking-tight">
          Pyrobot{' '}
          <span className="text-gold" aria-hidden="true">
            ✦
          </span>
        </span>
      </div>

      <button
        onClick={cycleTheme}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-gold hover:bg-gold/10 transition-all"
        style={{ transition: 'var(--animate-fast)' }}
        aria-label={`Switch theme (current: ${theme ?? 'system'})`}
      >
        <ThemeIcon size={18} />
      </button>
    </header>
  );
}