import { useOutletContext } from 'react-router-dom';
import { Badge } from '@repolens/ui';
import { formatBytes, formatCompactNumber, timeAgo } from '@repolens/utils';
import type { RepoOutletContext } from './RepoShell.js';
import { useLanguages } from '../hooks/useRepoQueries.js';
import { LanguageBar } from '../components/LanguageBar.js';
import { CollarBlock, IndexRow } from '../components/Collar.js';
import { LoadingState } from '../components/LoadingState.js';
import { ErrorState } from '../components/ErrorState.js';
import { isRecent } from '../lib/recency.js';

export function Overview() {
  const { repository } = useOutletContext<RepoOutletContext>();
  const languages = useLanguages(repository.owner.login, repository.name);
  const revisedRecently = isRecent(repository.pushedAt);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-8 py-7">
      <header className="flex items-start gap-4">
        <img
          src={repository.owner.avatarUrl}
          alt=""
          className="mt-1 h-14 w-14 border border-rule grayscale"
        />
        <div className="min-w-0 flex-1">
          <p className="font-collar text-sm text-text-muted">{repository.owner.login}</p>
          <h1 className="font-collar text-3xl font-bold leading-none tracking-tight text-text-primary">
            {repository.name}
          </h1>
          {repository.description && (
            <p className="mt-2 max-w-2xl text-base text-text-secondary">{repository.description}</p>
          )}
          {(repository.isArchived || repository.isFork || repository.topics.length > 0) && (
            <div className="mt-3 flex flex-wrap gap-1">
              {repository.isArchived && <Badge tone="muted">Archived</Badge>}
              {repository.isFork && <Badge>Fork</Badge>}
              {repository.topics.map((topic) => (
                <Badge key={topic}>{topic}</Badge>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Doubled rule closes the title block, as a neatline closes a sheet. */}
      <div className="border-b-[3px] border-double border-rule" />

      <div className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-3">
        <CollarBlock caption="Survey">
          <IndexRow label="Surveyed" value={timeAgo(repository.createdAt)} />
          <IndexRow
            label="Revised"
            value={timeAgo(repository.pushedAt)}
            emphasis={revisedRecently}
          />
          <IndexRow
            label="Sheet"
            value={<span className="font-mono">{repository.defaultBranch}</span>}
          />
          <IndexRow label="Extent" value={formatBytes(repository.size * 1024)} />
        </CollarBlock>

        <CollarBlock caption="Attention">
          <IndexRow label="Stars" value={formatCompactNumber(repository.stargazersCount)} />
          <IndexRow label="Forks" value={formatCompactNumber(repository.forksCount)} />
          <IndexRow label="Watchers" value={formatCompactNumber(repository.watchersCount)} />
          <IndexRow label="Open issues" value={formatCompactNumber(repository.openIssuesCount)} />
        </CollarBlock>

        <CollarBlock caption="Rights">
          <IndexRow label="License" value={repository.license?.spdxId ?? 'None stated'} />
          <IndexRow label="Access" value={repository.isPrivate ? 'Private' : 'Public'} />
          <IndexRow label="Primary language" value={repository.language ?? 'Mixed'} />
          <IndexRow label="Homepage" value={repository.homepage ? 'Listed' : '—'} />
        </CollarBlock>
      </div>

      <CollarBlock caption="Legend">
        {languages.isLoading && <LoadingState label="Reading composition" />}
        {languages.isError && <ErrorState error={languages.error} />}
        {languages.data && <LanguageBar languages={languages.data} />}
      </CollarBlock>
    </div>
  );
}
