import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Package, Search } from 'lucide-react';
import { GitHubApiError } from '@repolens/types';
import { colorForExtension } from '@repolens/graph';
import type { RepoOutletContext } from './RepoShell.js';
import { useDependencies } from '../hooks/useRepoQueries.js';
import { LoadingState } from '../components/LoadingState.js';

/** Ecosystem names map onto the same palette the file map uses. */
const ECOSYSTEM_EXTENSION: Record<string, string> = {
  npm: 'js',
  cargo: 'rs',
  pypi: 'py',
  golang: 'go',
  maven: 'java',
  nuget: 'cs',
  composer: 'php',
  gem: 'rb',
  actions: 'yml',
  swift: 'swift',
};

export function Dependencies() {
  const { repository } = useOutletContext<RepoOutletContext>();
  const query = useDependencies(repository.owner.login, repository.name);
  const [filter, setFilter] = useState('');

  const groups = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    const matched = (query.data ?? []).filter(
      (d) => !needle || d.name.toLowerCase().includes(needle),
    );
    const byEcosystem = new Map<string, typeof matched>();
    for (const dep of matched) {
      const list = byEcosystem.get(dep.ecosystem) ?? [];
      list.push(dep);
      byEcosystem.set(dep.ecosystem, list);
    }
    return [...byEcosystem.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [query.data, filter]);

  const total = query.data?.length ?? 0;
  const shown = groups.reduce((sum, [, list]) => sum + list.length, 0);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 px-8 py-7">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Dependencies</h1>
        <p className="mt-1 text-[13px] text-text-secondary">
          Read from GitHub&apos;s dependency graph, so it covers every manifest in the repository —
          not just the one at the root.
        </p>
      </div>

      {query.isLoading && <LoadingState label="Reading the dependency graph" />}

      {query.isError && <DependencyError error={query.error} />}

      {query.data && total === 0 && (
        <p className="py-12 text-center text-[13px] text-text-secondary">
          GitHub has no dependencies recorded for this repository.
        </p>
      )}

      {total > 0 && (
        <>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter packages"
              className="h-8 w-full rounded-control border border-rule bg-surface-2 pl-8 pr-3 text-[13px] placeholder:text-text-muted focus:border-accent focus:outline-none"
            />
          </div>
          <p className="text-xs text-text-muted">
            <span className="tabular">{shown}</span>
            {filter ? ` of ${total}` : ''} packages across{' '}
            <span className="tabular">{groups.length}</span> ecosystems
          </p>

          <div className="flex flex-col gap-6">
            {groups.map(([ecosystem, deps]) => (
              <section key={ecosystem}>
                <div className="flex items-center gap-2 border-b border-rule pb-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: colorForExtension(ECOSYSTEM_EXTENSION[ecosystem]) }}
                  />
                  <h2 className="text-[13px] font-medium text-text-primary">{ecosystem}</h2>
                  <span className="text-xs tabular text-text-muted">{deps.length}</span>
                </div>
                <ul className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
                  {deps.map((dep) => (
                    <li
                      key={`${dep.ecosystem}:${dep.name}`}
                      className="flex items-baseline gap-2 border-b border-rule/50 py-1.5"
                    >
                      <Package className="h-3 w-3 shrink-0 self-center text-text-muted" />
                      <span className="min-w-0 flex-1 truncate font-mono text-xs text-text-primary">
                        {dep.name}
                      </span>
                      {dep.version && (
                        <span className="shrink-0 font-mono text-2xs tabular text-text-muted">
                          {dep.version}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * The SBOM endpoint 500s on very large repositories and 404s when the
 * dependency graph is switched off, so both get a specific explanation.
 */
function DependencyError({ error }: { error: unknown }) {
  const status = error instanceof GitHubApiError ? error.status : 0;
  const message =
    status === 404
      ? 'This repository has its dependency graph disabled, so GitHub exposes nothing to read.'
      : status >= 500
        ? "GitHub could not generate this repository's dependency graph. That usually means the repository is too large for the endpoint."
        : error instanceof Error
          ? error.message
          : 'Could not load dependencies.';

  return <p className="py-12 text-center text-[13px] text-text-secondary">{message}</p>;
}
