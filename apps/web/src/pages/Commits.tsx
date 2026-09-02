import { useOutletContext } from 'react-router-dom';
import { GitCommitHorizontal } from 'lucide-react';
import { Button, cn } from '@repolens/ui';
import { timeAgo } from '@repolens/utils';
import type { RepoOutletContext } from './RepoShell.js';
import { useCommits } from '../hooks/useRepoQueries.js';
import { CollarBlock } from '../components/Collar.js';
import { LoadingState } from '../components/LoadingState.js';
import { ErrorState } from '../components/ErrorState.js';
import { isRecent } from '../lib/recency.js';

export function Commits() {
  const { repository } = useOutletContext<RepoOutletContext>();
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useCommits(repository.owner.login, repository.name);

  if (isLoading) return <LoadingState label="Loading commits…" />;
  if (isError) return <ErrorState error={error} />;

  const commits = data?.pages.flat() ?? [];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-8 py-7">
      <CollarBlock caption={`Revisions to ${repository.defaultBranch}`}>
        <ul className="flex flex-col divide-y divide-rule/40">
          {commits.map((commit) => {
            const recent = isRecent(commit.author.date);
            return (
              <li key={commit.sha} className="flex items-start gap-3 py-2">
                <GitCommitHorizontal
                  className={cn(
                    'mt-1 h-3.5 w-3.5 shrink-0',
                    recent ? 'text-signal-ink' : 'text-structure',
                  )}
                  strokeWidth={1.75}
                />
                <div className="min-w-0 flex-1">
                  <a
                    href={commit.htmlUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="line-clamp-1 text-base text-text-primary hover:underline hover:decoration-dotted"
                  >
                    {commit.message.split('\n')[0]}
                  </a>
                  <p className="mt-0.5 flex items-center gap-1.5 font-collar text-sm text-text-secondary">
                    {commit.author.avatarUrl && (
                      <img src={commit.author.avatarUrl} alt="" className="h-4 w-4 grayscale" />
                    )}
                    <span>{commit.author.login ?? commit.author.name}</span>
                    <span className={cn('tabular', recent ? 'text-signal-ink' : 'text-text-muted')}>
                      {timeAgo(commit.author.date)}
                    </span>
                  </p>
                </div>
                <span className="shrink-0 font-mono text-xs text-text-muted">
                  {commit.sha.slice(0, 7)}
                </span>
              </li>
            );
          })}
        </ul>
      </CollarBlock>
      {hasNextPage && (
        <Button
          variant="secondary"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="self-center"
        >
          {isFetchingNextPage ? 'Loading' : 'Load more'}
        </Button>
      )}
    </div>
  );
}
