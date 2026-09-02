import { AlertTriangle } from 'lucide-react';
import { GitHubApiError } from '@repolens/types';

export function ErrorState({ error }: { error: unknown }) {
  const isApiError = error instanceof GitHubApiError;
  const message = error instanceof Error ? error.message : 'Something went wrong.';
  const isRateLimited = isApiError && error.status === 403 && error.rateLimit?.remaining === 0;

  return (
    <div className="flex h-full min-h-[240px] flex-col items-center justify-center gap-3 px-6 text-center">
      <AlertTriangle className="h-5 w-5 text-text-muted" strokeWidth={1.75} />
      <p className="max-w-md text-base text-text-secondary">
        {isRateLimited
          ? 'GitHub is rate-limiting you. Add a personal access token in Settings and it will stop.'
          : message}
      </p>
    </div>
  );
}
