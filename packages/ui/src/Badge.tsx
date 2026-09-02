import type { ReactNode } from 'react';
import { cn } from './cn.js';

/** A legend chip. Rectangular, because legend keys on a sheet are boxes. */
export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  /** `current` is the only tone allowed the signal green — it never marks an error. */
  tone?: 'neutral' | 'current' | 'muted';
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: 'border-structure/60 text-text-secondary',
    current: 'border-signal/70 text-signal-ink',
    muted: 'border-structure/30 text-text-muted',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center border px-1.5 py-px font-collar text-xs leading-4',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
