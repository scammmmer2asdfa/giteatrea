import type { ReactNode } from 'react';
import { cn } from './cn.js';

/** Orange marks what's current or needs attention; everything else stays neutral. */
export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: 'neutral' | 'accent' | 'outline';
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: 'border-transparent bg-surface-3 text-text-secondary',
    accent: 'border-transparent bg-accent text-black',
    outline: 'border-rule bg-transparent text-text-muted',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-control border px-1.5 py-[1px] text-2xs font-medium leading-4',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
