import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type GlassVariant = 'heavy' | 'medium' | 'light' | 'dark';

interface GlassCardProps {
  children: ReactNode;
  variant?: GlassVariant;
  className?: string;
  as?: React.ElementType;
}

const VARIANT_CLASS: Record<GlassVariant, string> = {
  heavy:  'glass-heavy',
  medium: 'glass-medium',
  light:  'glass-light',
  dark:   'glass-dark',
};

export function GlassCard({
  children,
  variant = 'light',
  className,
  as: Tag = 'div',
}: GlassCardProps) {
  return (
    <Tag className={cn('rounded-2xl', VARIANT_CLASS[variant], className)}>
      {children}
    </Tag>
  );
}