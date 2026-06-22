'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import type { ReactNode } from 'react';

export function AuthGuard({ children }: { children: ReactNode }) {
  const { _hasHydrated, accessToken } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (_hasHydrated && !accessToken) {
      router.replace('/login');
    }
  }, [_hasHydrated, accessToken, router]);

  // Still reading from localStorage — show nothing to avoid a flash
  // of dashboard content before we know whether the user is logged in.
  if (!_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin"
            aria-label="Loading"
          />
          <span className="text-caption text-muted-foreground">Loading…</span>
        </div>
      </div>
    );
  }

  // Hydrated but no token — useEffect above will redirect.
  // Return null so the dashboard content never flashes.
  if (!accessToken) return null;

  return <>{children}</>;
}