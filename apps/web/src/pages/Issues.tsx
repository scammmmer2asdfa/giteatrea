import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { CircleDot, CircleCheck, MessageSquare } from 'lucide-react';
import { Button } from '@repolens/ui';
import { timeAgo } from '@repolens/utils';
import type { RepoOutletContext } from './RepoShell.js';
import { useIssues } from '../hooks/useRepoQueries.js';
import { FilterTabs } from '../components/FilterTabs.js';
import { LoadingState } from '../components/LoadingState.js';
import { ErrorState } from '../components/ErrorState.js';

type State = 'open' | 'closed' | 'all';

export function Issues() {
  const { repository } = useOutletContext<RepoOutletContext>();
  const [state, setState] = useState<State>('open');
  const query = useIssues(repository.owner.login, repository.name, state);
  const items = query.data?.pages.flat() ?? [];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 px-8 py-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold tracking-tight">Issues</h1>
        <FilterTabs
          value={state}
          onChange={setState}
          options={[
            { value: 'open', label: 'Open' },
            { value: 'closed', label: 'Closed' },
            { value: 'all', label: 'All' },
          ]}
        />
      </div>

      {query.isLoading && <LoadingState label="Loading issues" />}
      {query.isError && <ErrorState error={query.error} />}

      {!query.isLoading && items.length === 0 && (
        <p className="py-12 text-center text-[13px] text-text-secondary">
          No {state === 'all' ? '' : state} issues.
        </p>
      )}

      {items.length > 0 && (
        <ul className="divide-y divide-rule border-y border-rule">
          {items.map((issue) => (
            <li key={issue.number}>
              <a
                href={issue.htmlUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-3 py-2.5 hover:bg-surface-2"
              >
                <span className="pt-0.5">
                  {issue.state === 'open' ? (
                    <CircleDot className="h-4 w-4 shrink-0 text-accent" strokeWidth={1.75} />
                  ) : (
                    <CircleCheck className="h-4 w-4 shrink-0 text-text-muted" strokeWidth={1.75} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-text-primary">{issue.title}</p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    <span className="tabular">#{issue.number}</span>
                    {issue.author && ` by ${issue.author.login}`} · opened{' '}
                    {timeAgo(issue.createdAt)}
                  </p>
                  {issue.labels.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {issue.labels.map((label) => (
                        <span
                          key={label}
                          className="rounded-control border border-rule px-1.5 py-px text-2xs text-text-secondary"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {issue.comments > 0 && (
                  <span className="flex shrink-0 items-center gap-1 pt-0.5 text-xs tabular text-text-muted">
                    <MessageSquare className="h-3 w-3" />
                    {issue.comments}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}

      {query.hasNextPage && (
        <Button
          variant="secondary"
          className="self-center"
          onClick={() => query.fetchNextPage()}
          disabled={query.isFetchingNextPage}
        >
          {query.isFetchingNextPage ? 'Loading' : 'Load more'}
        </Button>
      )}
    </div>
  );
}
