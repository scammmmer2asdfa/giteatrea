import type { ReactNode } from 'react';
import { cn } from '@repolens/ui';

/**
 * A block of sheet marginalia: a rule, a caption, and rows beneath it.
 * The rule is what groups the rows — there is no card, box, or shadow.
 */
export function CollarBlock({
  caption,
  children,
  className,
}: {
  caption: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('flex flex-col', className)}>
      <div className="flex items-center gap-2 border-b border-rule pb-1">
        <h2 className="font-collar text-xs font-semibold tracking-[0.08em] text-text-secondary">
          {caption}
        </h2>
      </div>
      <div className="pt-2">{children}</div>
    </section>
  );
}

/** One index entry: name on the left, dotted leader, figure right-aligned. */
export function IndexRow({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: ReactNode;
  emphasis?: boolean;
}) {
  return (
    <div className="leader py-[3px] text-sm">
      <span className="font-collar text-text-muted">{label}</span>
      <span className="leader-fill" aria-hidden="true" />
      <span className={cn('tabular', emphasis ? 'text-signal-ink' : 'text-text-primary')}>
        {value}
      </span>
    </div>
  );
}
