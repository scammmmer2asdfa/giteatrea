import type { ReactNode } from 'react';
import { cn } from '@repolens/ui';

/** A named block of readouts. The legend and rule group it; there is no card. */
export function Panel({
  legend,
  actions,
  children,
  className,
}: {
  legend: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('flex min-w-0 flex-col', className)}>
      <div className="flex items-center justify-between gap-3 border-b border-rule pb-1.5">
        <h2 className="legend">{legend}</h2>
        {actions}
      </div>
      <div className="pt-2.5">{children}</div>
    </section>
  );
}

export type ReadoutTone = 'default' | 'live' | 'caution';

const TONE_CLASS: Record<ReadoutTone, string> = {
  default: 'text-text-primary',
  live: 'text-accent',
  caution: 'text-accent',
};

/** One instrument readout: label left, value right, values aligned down the stack. */
export function Readout({
  label,
  value,
  tone = 'default',
  mono = false,
}: {
  label: string;
  value: ReactNode;
  tone?: ReadoutTone;
  mono?: boolean;
}) {
  return (
    <div className="readout">
      <span className="shrink-0 text-xs text-text-secondary">{label}</span>
      <span
        className={cn(
          'min-w-0 truncate text-right text-[13px] tabular',
          mono && 'font-mono text-xs',
          TONE_CLASS[tone],
        )}
      >
        {value}
      </span>
    </div>
  );
}

/** A large primary figure, for the handful of numbers worth reading at a glance. */
export function Gauge({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: ReactNode;
  tone?: ReadoutTone;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="legend">{label}</span>
      <span className={cn('truncate text-xl font-semibold tabular', TONE_CLASS[tone])}>
        {value}
      </span>
    </div>
  );
}
