import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ExternalLink, GitFork, Lock, Search, Star } from 'lucide-react';
import { Badge, Button, cn } from '@repolens/ui';
import { formatCompactNumber, timeAgo } from '@repolens/utils';
import { colorForExtension } from '@repolens/graph';
import { TopBar } from '../components/TopBar.js';
import { LoadingState } from '../components/LoadingState.js';
import { ErrorState } from '../components/ErrorState.js';
import { useAllOwnerRepositories, useOwnerProfile, useViewer } from '../hooks/useRepoQueries.js';
import { isRecent } from '../lib/recency.js';

type SortKey = 'pushed' | 'stars' | 'name';

const LANGUAGE_EXTENSIONS: Record<string, string> = {
  TypeScript: 'ts',
  JavaScript: 'js',
  Python: 'py',
  Ruby: 'rb',
  Go: 'go',
  Rust: 'rs',
  Java: 'java',
  Kotlin: 'kt',
  'C++': 'cpp',
  'C#': 'cs',
  C: 'c',
  PHP: 'php',
  Swift: 'swift',
  CSS: 'css',
  HTML: 'html',
  Shell: 'sh',
  Vue: 'vue',
  Svelte: 'svelte',
};

export function Owner() {
  const { owner = '' } = useParams<{ owner: string }>();
  const profile = useOwnerProfile(owner);
  const repos = useAllOwnerRepositories(owner);
  const viewer = useViewer();
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState<SortKey>('pushed');

  const isViewer = Boolean(viewer.data && viewer.data.login.toLowerCase() === owner.toLowerCase());

  const all = useMemo(() => repos.data?.pages.flat() ?? [], [repos.data]);

  const visible = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    const matched = needle
      ? all.filter(
          (r) =>
            r.name.toLowerCase().includes(needle) ||
            (r.description ?? '').toLowerCase().includes(needle) ||
            (r.language ?? '').toLowerCase().includes(needle),
        )
      : all;

    return [...matched].sort((a, b) => {
      if (sort === 'stars') return b.stargazersCount - a.stargazersCount;
      if (sort === 'name') return a.name.localeCompare(b.name);
      return new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime();
    });
  }, [all, filter, sort]);

  const privateCount = all.filter((r) => r.isPrivate).length;

  return (
    <div className="flex h-screen flex-col bg-surface text-text-primary">
      <TopBar />
      <main className="flex-1 overflow-auto">
        {profile.isLoading && <LoadingState label={`Loading ${owner}`} />}
        {profile.isError && <ErrorState error={profile.error} />}

        {profile.data && (
          <div className="mx-auto max-w-5xl px-8 py-8">
            <header className="flex items-start gap-5">
              <img
                src={profile.data.avatarUrl}
                alt=""
                className="h-16 w-16 shrink-0 border border-rule"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight">
                    {profile.data.name ?? profile.data.login}
                  </h1>
                  <Badge tone="outline">{profile.data.type}</Badge>
                  {isViewer && <Badge tone="accent">You</Badge>}
                </div>
                <a
                  href={profile.data.htmlUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-0.5 inline-flex items-center gap-1 font-mono text-xs text-text-muted hover:text-text-secondary"
                >
                  {profile.data.login}
                  <ExternalLink className="h-3 w-3" />
                </a>
                {profile.data.bio && (
                  <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-text-secondary">
                    {profile.data.bio}
                  </p>
                )}
                <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-text-muted">
                  <span>
                    <span className="tabular text-text-secondary">
                      {formatCompactNumber(profile.data.publicRepos)}
                    </span>{' '}
                    public repositories
                  </span>
                  {profile.data.followers > 0 && (
                    <span>
                      <span className="tabular text-text-secondary">
                        {formatCompactNumber(profile.data.followers)}
                      </span>{' '}
                      followers
                    </span>
                  )}
                  {profile.data.location && <span>{profile.data.location}</span>}
                  <span>Joined {timeAgo(profile.data.createdAt)}</span>
                </dl>
              </div>
            </header>

            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-rule pt-4">
              <div className="relative min-w-[200px] flex-1">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
                <input
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Filter repositories"
                  className="h-8 w-full rounded-control border border-rule bg-surface-2 pl-8 pr-3 text-[13px] placeholder:text-text-muted focus:border-accent focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-1">
                {(['pushed', 'stars', 'name'] as SortKey[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setSort(key)}
                    className={cn(
                      'h-8 rounded-control border px-2.5 text-xs',
                      sort === key
                        ? 'border-accent bg-accent/10 text-text-primary'
                        : 'border-rule text-text-secondary hover:bg-surface-2',
                    )}
                  >
                    {key === 'pushed' ? 'Recent' : key === 'stars' ? 'Stars' : 'Name'}
                  </button>
                ))}
              </div>
            </div>

            <p className="mt-2 text-xs text-text-muted">
              <span className="tabular">{visible.length}</span>
              {filter ? ` of ${all.length}` : ''} shown
              {privateCount > 0 && (
                <>
                  {' · '}
                  <span className="tabular text-accent-ink">{privateCount}</span> private
                </>
              )}
              {!viewer.data && (
                <>
                  {' · '}
                  <Link to="/settings" className="link">
                    Add a token
                  </Link>{' '}
                  to see private repositories
                </>
              )}
            </p>

            {repos.isLoading && <LoadingState label="Loading repositories" />}
            {repos.isError && <ErrorState error={repos.error} />}

            {!repos.isLoading && visible.length === 0 && (
              <p className="py-12 text-center text-[13px] text-text-secondary">
                {all.length === 0 ? 'No repositories here.' : 'Nothing matches that filter.'}
              </p>
            )}

            <ul className="mt-4 divide-y divide-rule border-y border-rule">
              {visible.map((repo) => (
                <li key={repo.id}>
                  <Link
                    to={`/${repo.owner.login}/${repo.name}`}
                    className="flex items-start gap-4 px-1 py-3 hover:bg-surface-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[14px] font-medium text-text-primary">
                          {repo.name}
                        </span>
                        {repo.isPrivate && (
                          <span className="inline-flex items-center gap-1 text-2xs text-accent-ink">
                            <Lock className="h-3 w-3" />
                            Private
                          </span>
                        )}
                        {repo.isFork && (
                          <span className="inline-flex items-center gap-1 text-2xs text-text-muted">
                            <GitFork className="h-3 w-3" />
                            Fork
                          </span>
                        )}
                        {repo.isArchived && <Badge tone="outline">Archived</Badge>}
                      </div>
                      {repo.description && (
                        <p className="mt-1 line-clamp-2 max-w-2xl text-[13px] leading-relaxed text-text-secondary">
                          {repo.description}
                        </p>
                      )}
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
                        {repo.language && (
                          <span className="inline-flex items-center gap-1.5">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{
                                backgroundColor: colorForExtension(
                                  LANGUAGE_EXTENSIONS[repo.language],
                                ),
                              }}
                            />
                            {repo.language}
                          </span>
                        )}
                        {repo.stargazersCount > 0 && (
                          <span className="inline-flex items-center gap-1 tabular">
                            <Star className="h-3 w-3" />
                            {formatCompactNumber(repo.stargazersCount)}
                          </span>
                        )}
                        <span
                          className={cn(
                            'tabular',
                            // Sorting by recency already conveys this, so the
                            // accent only earns its place under other sorts.
                            sort !== 'pushed' && isRecent(repo.pushedAt) && 'text-accent-ink',
                          )}
                        >
                          Updated {timeAgo(repo.pushedAt)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            {repos.hasNextPage && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="secondary"
                  onClick={() => repos.fetchNextPage()}
                  disabled={repos.isFetchingNextPage}
                >
                  {repos.isFetchingNextPage ? 'Loading' : 'Load more'}
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
