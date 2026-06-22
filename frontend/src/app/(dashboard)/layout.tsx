import type { ReactNode } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNavBar } from '@/components/layout/BottomNavBar';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen bg-background">
        <TopBar />
        <main className="flex-1 overflow-y-auto pt-16 pb-24">
          {children}
        </main>
        <BottomNavBar />
      </div>
    </AuthGuard>
  );
}