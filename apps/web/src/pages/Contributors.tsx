import { useOutletContext } from 'react-router-dom';
import type { RepoOutletContext } from './RepoShell.js';
import { useContributors } from '../hooks/useRepoQueries.js';
import { Panel } from '../components/Panel.js';
import { LoadingState } from '../components/LoadingState.js';
import { ErrorState } from '../components/ErrorState.js';
import { formatCompactNumber } from '@repolens/utils';

export function Contributors() {
  const { repository } = useOutletContext<RepoOutletContext>();
  const contributors = useContributors(repository.owner.login, repository.name);

  if (contributors.isLoading) return <LoadingState label="Loading contributors" />;
  if (contributors.isError) return <ErrorState error={contributors.error} />;

  const people = contributors.data ?? [];
  const max = Math.max(1, ...people.map((c) => c.contributions));
  const total = people.reduce((sum, c) => sum + c.contributions, 0);

  return (
    <div className="flex flex-col gap-4 p-6">
      <Panel
        legend={`${people.length} contributors · ${formatCompactNumber(total)} commits`}
        actions={<span className="text-2xs text-text-muted">ranked by commit count</span>}
      >
        {/* Ordinals are real here: the list is ranked, not merely enumerated. */}
        <ol className="flex flex-col divide-y divide-rule/60">
          {people.map((person, index) => (
            <li key={person.login} className="flex items-center gap-3 py-1.5">
              <span className="w-6 shrink-0 text-right font-mono text-2xs text-text-muted tabular">
                {index + 1}
              </span>
              <img src={person.avatarUrl} alt="" className="h-5 w-5 shrink-0 rounded-full" />
              <a
                href={person.htmlUrl}
                target="_blank"
                rel="noreferrer"
                className="w-44 shrink-0 truncate text-[13px] text-text-primary hover:text-accent"
              >
                {person.login}
              </a>
              <span className="hidden min-w-0 flex-1 sm:block">
                <span
                  className="block h-1.5 rounded-full bg-accent/60"
                  style={{ width: `${Math.max(2, (person.contributions / max) * 100)}%` }}
                />
              </span>
              <span className="w-14 shrink-0 text-right font-mono text-xs text-text-secondary tabular">
                {formatCompactNumber(person.contributions)}
              </span>
            </li>
          ))}
        </ol>
      </Panel>
    </div>
  );
}
