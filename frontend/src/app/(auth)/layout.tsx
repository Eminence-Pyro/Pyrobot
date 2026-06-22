import type { ReactNode } from 'react';

// Auth screens get a clean, centered, dark-gradient layout —
// no navigation bars, no sidebars.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #0A0A0A 0%, #1C1C1E 100%)' }}
    >
      {children}
    </div>
  );
}