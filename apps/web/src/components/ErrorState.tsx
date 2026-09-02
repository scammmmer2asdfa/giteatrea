import { TriangleAlert } from 'lucide-react';
import { GitHubApiError } from '@repolens/types';

export function ErrorState({ error }: { error: unknown }) {
  const isApiError = error instanceof GitHubApiError;
  const message = error instanceof Error ? error.message : 'Something went wrong.';
  const status = isApiError ? error.status : undefined;
  const isRateLimited = isApiError && error.status === 403 && error.rateLimit?.remaining === 0;

  const hint = isRateLimited
    ? 'GitHub is rate-limiting you. Add a personal access token in Settings and it will stop.'
    : status === 404
      ? 'No repository at that path, or it is private and this token cannot see it.'
      : status === 401
        ? 'GitHub rejected the token. Check it in Settings.'
        : null;

  return (
    <div className="flex h-full min-h-[200px] items-center justify-center p-6">
      <div className="field w-full max-w-md border-accent/40">
        <div className="flex items-center gap-2 border-b border-accent/30 bg-accent/10 px-3 py-1.5">
          <TriangleAlert className="h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={2} />
          <span className="legend text-accent">
            {status ? `GitHub ${status}` : 'Request failed'}
          </span>
        </div>
        <div className="flex flex-col gap-2 px-3 py-2.5">
          <p className="font-mono text-xs leading-relaxed text-text-primary">{message}</p>
          {hint && <p className="text-xs text-text-secondary">{hint}</p>}
        </div>
      </div>
    </div>
  );
}
