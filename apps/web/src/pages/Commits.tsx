import { useOutletContext } from 'react-router-dom';
import { Button } from '@repolens/ui';
import { timeAgo } from '@repolens/utils';
import type { RepoOutletContext } from './RepoShell.js';
import { useCommits } from '../hooks/useRepoQueries.js';
import { Panel } from '../components/Panel.js';
import { LoadingState } from '../components/LoadingState.js';
import { ErrorState } from '../components/ErrorState.js';
import { isRecent } from '../lib/recency.js';

export function Commits() {
  const { repository } = useOutletContext<RepoOutletContext>();
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useCommits(repository.owner.login, repository.name);

  if (isLoading) return <LoadingState label="Loading commits" />;
  if (isError) return <ErrorState error={error} />;

  const commits = data?.pages.flat() ?? [];

  return (
    <div className="flex flex-col gap-4 p-6">
      <Panel
        legend={`${repository.defaultBranch} · ${commits.length} commits loaded`}
        actions={
          <span className="flex items-center gap-1.5 text-2xs text-text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            last 14 days
          </span>
        }
      >
        <ul className="flex flex-col divide-y divide-rule/60">
          {commits.map((commit) => {
            const fresh = isRecent(commit.author.date);
            return (
              <li key={commit.sha} className="flex items-center gap-3 py-2">
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${fresh ? 'bg-accent' : 'bg-rule-strong'}`}
                />
                <a
                  href={commit.htmlUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="min-w-0 flex-1 truncate text-[13px] text-text-primary hover:text-accent"
                >
                  {commit.message.split('\n')[0]}
                </a>
                <span className="hidden shrink-0 items-center gap-1.5 text-xs text-text-secondary sm:flex">
                  {commit.author.avatarUrl && (
                    <img src={commit.author.avatarUrl} alt="" className="h-4 w-4 rounded-full" />
                  )}
                  <span className="max-w-[10rem] truncate">
                    {commit.author.login ?? commit.author.name}
                  </span>
                </span>
                <span className="w-20 shrink-0 text-right text-xs text-text-muted tabular">
                  {timeAgo(commit.author.date)}
                </span>
                <span className="hidden w-16 shrink-0 text-right font-mono text-xs text-text-muted md:block">
                  {commit.sha.slice(0, 7)}
                </span>
              </li>
            );
          })}
        </ul>
      </Panel>
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
