import type { ReactNode } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function ChatSessionLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex flex-col h-screen bg-background overflow-hidden">
        {children}
      </div>
    </AuthGuard>
  );
}