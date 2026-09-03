import { useOutletContext } from 'react-router-dom';
import { Tag } from 'lucide-react';
import { Badge, Button } from '@repolens/ui';
import { timeAgo } from '@repolens/utils';
import type { RepoOutletContext } from './RepoShell.js';
import { useReleases } from '../hooks/useRepoQueries.js';
import { LoadingState } from '../components/LoadingState.js';
import { ErrorState } from '../components/ErrorState.js';

/** Release notes are Markdown; shown as trimmed plain text rather than rendered. */
function summarise(body: string | null): string | null {
  if (!body) return null;
  const text = body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^#+\s*/gm, '')
    .replace(/[*_`>]/g, '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .join(' ');
  return text.length > 260 ? `${text.slice(0, 260)}…` : text || null;
}

export function Releases() {
  const { repository } = useOutletContext<RepoOutletContext>();
  const query = useReleases(repository.owner.login, repository.name);
  const items = query.data?.pages.flat() ?? [];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-8 py-7">
      <h1 className="text-xl font-semibold tracking-tight">Releases</h1>

      {query.isLoading && <LoadingState label="Loading releases" />}
      {query.isError && <ErrorState error={query.error} />}

      {!query.isLoading && items.length === 0 && (
        <p className="py-12 text-center text-[13px] text-text-secondary">
          This repository has no published releases.
        </p>
      )}

      {items.length > 0 && (
        <ul className="divide-y divide-rule border-y border-rule">
          {items.map((release, index) => {
            const summary = summarise(release.body);
            return (
              <li key={release.id} className="py-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Tag className="h-3.5 w-3.5 shrink-0 text-text-muted" strokeWidth={1.75} />
                  <a
                    href={release.htmlUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[13px] font-medium text-text-primary hover:text-accent"
                  >
                    {release.tagName}
                  </a>
                  {/* Only the newest non-prerelease is what people actually want. */}
                  {index === 0 && !release.isPrerelease && !release.isDraft && (
                    <Badge tone="accent">Latest</Badge>
                  )}
                  {release.isPrerelease && <Badge tone="outline">Pre-release</Badge>}
                  {release.isDraft && <Badge tone="outline">Draft</Badge>}
                  {release.publishedAt && (
                    <span className="text-xs tabular text-text-muted">
                      {timeAgo(release.publishedAt)}
                    </span>
                  )}
                </div>
                {release.name && release.name !== release.tagName && (
                  <p className="mt-1 text-[13px] text-text-primary">{release.name}</p>
                )}
                {summary && (
                  <p className="mt-1 text-xs leading-relaxed text-text-secondary">{summary}</p>
                )}
              </li>
            );
          })}
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
