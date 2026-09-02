import { useOutletContext } from 'react-router-dom';
import { Badge } from '@repolens/ui';
import { formatBytes, formatCompactNumber, timeAgo } from '@repolens/utils';
import type { RepoOutletContext } from './RepoShell.js';
import { useCommits, useContributors, useLanguages } from '../hooks/useRepoQueries.js';
import { LanguageBar } from '../components/LanguageBar.js';
import { Gauge, Panel, Readout } from '../components/Panel.js';
import { LoadingState } from '../components/LoadingState.js';
import { ErrorState } from '../components/ErrorState.js';
import { isRecent } from '../lib/recency.js';

export function Overview() {
  const { repository } = useOutletContext<RepoOutletContext>();
  const owner = repository.owner.login;
  const languages = useLanguages(owner, repository.name);
  const contributors = useContributors(owner, repository.name);
  const commits = useCommits(owner, repository.name);

  const isLive = isRecent(repository.pushedAt);
  const recentCommits = commits.data?.pages[0] ?? [];

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex items-start gap-4">
        <img
          src={repository.owner.avatarUrl}
          alt=""
          className="mt-0.5 h-12 w-12 shrink-0 rounded-control border border-rule"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
            <span>{owner}</span>
            <span className="text-rule-strong">/</span>
          </div>
          <h1 className="truncate text-2xl font-semibold tracking-tight">{repository.name}</h1>
          {repository.description && (
            <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-text-secondary">
              {repository.description}
            </p>
          )}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {isLive && <Badge tone="accent">Active</Badge>}
            {repository.isArchived && <Badge tone="outline">Archived</Badge>}
            {repository.isFork && <Badge>Fork</Badge>}
            {repository.topics.slice(0, 6).map((topic) => (
              <Badge key={topic}>{topic}</Badge>
            ))}
          </div>
        </div>
      </header>

      {/* The five figures worth reading without stopping to parse a label. */}
      <div className="field grid grid-cols-2 gap-px overflow-hidden bg-rule sm:grid-cols-3 lg:grid-cols-5">
        {[
          { label: 'Stars', value: formatCompactNumber(repository.stargazersCount) },
          { label: 'Forks', value: formatCompactNumber(repository.forksCount) },
          { label: 'Open issues', value: formatCompactNumber(repository.openIssuesCount) },
          { label: 'Size', value: formatBytes(repository.size * 1024) },
          {
            label: 'Last push',
            value: timeAgo(repository.pushedAt),
            tone: isLive ? ('live' as const) : ('default' as const),
          },
        ].map((gauge) => (
          <div key={gauge.label} className="bg-surface-2 px-3.5 py-2.5">
            <Gauge label={gauge.label} value={gauge.value} tone={gauge.tone} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-x-10 gap-y-6 lg:grid-cols-3">
        <Panel legend="Composition">
          {languages.isLoading && <LoadingState label="Reading" className="min-h-[80px]" />}
          {languages.isError && <ErrorState error={languages.error} />}
          {languages.data && <LanguageBar languages={languages.data} />}
        </Panel>

        <Panel legend="Registry">
          <Readout label="Default branch" value={repository.defaultBranch} mono />
          <Readout label="License" value={repository.license?.spdxId ?? 'None'} />
          <Readout label="Visibility" value={repository.isPrivate ? 'Private' : 'Public'} />
          <Readout label="Created" value={timeAgo(repository.createdAt)} />
          <Readout
            label="Watchers"
            value={formatCompactNumber(repository.subscribersCount ?? repository.watchersCount)}
          />
        </Panel>

        <Panel
          legend={`Top contributors${contributors.data ? ` · ${contributors.data.length}` : ''}`}
        >
          {contributors.isLoading && <LoadingState label="Reading" className="min-h-[80px]" />}
          {contributors.isError && <ErrorState error={contributors.error} />}
          {contributors.data?.slice(0, 5).map((person, index) => (
            <div key={person.login} className="readout">
              <span className="flex min-w-0 items-center gap-2">
                <span className="w-3 shrink-0 text-right font-mono text-2xs text-text-muted tabular">
                  {index + 1}
                </span>
                <img src={person.avatarUrl} alt="" className="h-4 w-4 shrink-0 rounded-full" />
                <a
                  href={person.htmlUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate text-xs link"
                >
                  {person.login}
                </a>
              </span>
              <span className="shrink-0 font-mono text-xs text-text-secondary tabular">
                {formatCompactNumber(person.contributions)}
              </span>
            </div>
          ))}
        </Panel>
      </div>

      <Panel legend="Recent commits">
        {commits.isLoading && <LoadingState label="Reading" className="min-h-[80px]" />}
        {commits.isError && <ErrorState error={commits.error} />}
        <ul className="flex flex-col divide-y divide-rule/60">
          {recentCommits.slice(0, 8).map((commit) => {
            const fresh = isRecent(commit.author.date);
            return (
              <li key={commit.sha} className="flex items-center gap-3 py-1.5">
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
                <span className="hidden shrink-0 text-xs text-text-muted sm:block">
                  {commit.author.login ?? commit.author.name}
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
    </div>
  );
}
