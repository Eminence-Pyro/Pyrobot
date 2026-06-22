'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';

// Auth-aware root redirect.
// Waits for Zustand hydration before deciding where to send the user,
// so a logged-in user never gets bounced to /login on a hard refresh.
export default function RootPage() {
  const { _hasHydrated, accessToken } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (accessToken) {
      router.replace('/chat');
    } else {
      router.replace('/login');
    }
  }, [_hasHydrated, accessToken, router]);

  // Brief loading state while Zustand reads from localStorage
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div
        className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin"
        aria-label="Loading"
      />
    </div>
  );
}