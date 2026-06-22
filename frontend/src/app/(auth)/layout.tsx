'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { _hasHydrated, accessToken } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (_hasHydrated && accessToken) {
      router.replace('/chat');
    }
  }, [_hasHydrated, accessToken, router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #0A0A0A 0%, #1C1C1E 100%)' }}
    >
      {children}
    </div>
  );
}