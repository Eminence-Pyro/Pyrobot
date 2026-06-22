import type { ReactNode } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNavBar } from '@/components/layout/BottomNavBar';

// All dashboard screens share this shell:
//   TopBar (fixed, top)  → 64px (h-16)
//   <main>               → fills remaining space, scrollable
//   BottomNavBar (fixed) → 64px + safe area

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TopBar />
      <main className="flex-1 overflow-y-auto pt-16 pb-24">
        {children}
      </main>
      <BottomNavBar />
    </div>
  );
}