import { cn } from './cn.js';

export function Kbd({ children, className }: { children: string; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex h-4 min-w-4 items-center justify-center border border-rule px-1',
        'font-mono text-2xs text-text-muted',
        className,
      )}
    >
      {children}
    </kbd>
  );
}
