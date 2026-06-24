'use client';

import { useEffect, useState, type ReactNode } from 'react';

export function PageTransition({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Single RAF — fires once per page mount, no cleanup needed
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(6px)',
        transition: 'opacity 0.22s ease-out, transform 0.22s ease-out',
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}