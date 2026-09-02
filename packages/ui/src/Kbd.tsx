import { cn } from './cn.js';

export function Kbd({ children, className }: { children: string; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex h-[15px] min-w-[15px] items-center justify-center rounded-[2px] border border-rule',
        'bg-surface-3 px-1 font-mono text-2xs text-text-muted',
        className,
      )}
    >
      {children}
    </kbd>
  );
}
