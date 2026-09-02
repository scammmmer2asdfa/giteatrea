import { cn } from '@repolens/ui';

/** Indeterminate progress, drawn as a scanning bar rather than a spinner. */
export function LoadingState({
  label = 'Loading',
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex h-full min-h-[200px] flex-col items-center justify-center gap-3',
        className,
      )}
    >
      <div className="h-px w-40 overflow-hidden bg-rule">
        <div className="h-full w-1/3 animate-[scan_1.1s_ease-in-out_infinite] bg-accent" />
      </div>
      <p className="font-mono text-2xs uppercase tracking-[0.14em] text-text-muted">{label}</p>
    </div>
  );
}
