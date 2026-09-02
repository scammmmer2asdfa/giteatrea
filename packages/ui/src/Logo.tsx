import { cn } from './cn.js';

/**
 * The RepoLens mark: a viewfinder reticle framing one parcel of a treemap.
 * Kept to four shapes plus the brackets so it still reads at 16px.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn('h-5 w-5', className)}
      role="img"
      aria-label="RepoLens"
    >
      <g opacity="0.32" fill="currentColor">
        <rect x="2" y="2" width="10" height="8" rx="0.5" />
        <rect x="13.5" y="2" width="8.5" height="8" rx="0.5" />
        <rect x="2" y="12" width="8" height="10" rx="0.5" />
      </g>
      <rect x="12.5" y="13.5" width="7" height="6.5" rx="0.5" className="fill-accent" />
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
        <path d="M11 15v-3h3" />
        <path d="M21 15v-3h-3" />
        <path d="M11 18.5V21.5h3" />
        <path d="M21 18.5V21.5h-3" />
      </g>
    </svg>
  );
}

/** Mark plus wordmark, for the app header and the marketing site. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <Logo />
      <span className="text-[15px] font-semibold tracking-[-0.01em] text-text-primary">
        RepoLens
      </span>
    </span>
  );
}
