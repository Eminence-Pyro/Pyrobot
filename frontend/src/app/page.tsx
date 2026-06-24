'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';

export default function RootPage() {
  const { _hasHydrated, accessToken } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (!_hasHydrated) return;
    router.replace(accessToken ? '/chat' : '/welcome');
  }, [_hasHydrated, accessToken, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div
        className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin"
        aria-label="Loading"
      />
    </div>
  );
}