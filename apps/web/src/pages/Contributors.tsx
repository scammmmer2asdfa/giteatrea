import { useOutletContext } from 'react-router-dom';
import type { RepoOutletContext } from './RepoShell.js';
import { useContributors } from '../hooks/useRepoQueries.js';
import { CollarBlock } from '../components/Collar.js';
import { LoadingState } from '../components/LoadingState.js';
import { ErrorState } from '../components/ErrorState.js';
import { formatCompactNumber } from '@repolens/utils';

export function Contributors() {
  const { repository } = useOutletContext<RepoOutletContext>();
  const contributors = useContributors(repository.owner.login, repository.name);

  if (contributors.isLoading) return <LoadingState label="Loading contributors…" />;
  if (contributors.isError) return <ErrorState error={contributors.error} />;

  const maxContributions = Math.max(1, ...(contributors.data?.map((c) => c.contributions) ?? [1]));

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-8 py-7">
      <CollarBlock caption={`Survey party — ${contributors.data?.length ?? 0} recorded`}>
        {/* Ranked by commit count, so the ordinals are real, not decoration. */}
        <ol className="flex flex-col divide-y divide-rule/40">
          {contributors.data?.map((contributor, index) => (
            <li key={contributor.login} className="flex items-center gap-3 py-1.5">
              <span className="w-6 shrink-0 text-right font-collar text-xs tabular text-text-muted">
                {index + 1}
              </span>
              <img
                src={contributor.avatarUrl}
                alt=""
                className="h-6 w-6 shrink-0 border border-rule grayscale"
              />
              <a
                href={contributor.htmlUrl}
                target="_blank"
                rel="noreferrer"
                className="w-40 shrink-0 truncate text-base text-text-primary hover:underline hover:decoration-dotted"
              >
                {contributor.login}
              </a>
              <span
                className="h-2 shrink-0 bg-structure/70"
                style={{ width: `${(contributor.contributions / maxContributions) * 100}%` }}
                aria-hidden="true"
              />
              <span className="ml-auto shrink-0 font-collar text-sm tabular text-text-secondary">
                {formatCompactNumber(contributor.contributions)}
              </span>
            </li>
          ))}
        </ol>
      </CollarBlock>
    </div>
  );
}
