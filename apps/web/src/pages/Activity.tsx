import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { formatCompactNumber } from '@repolens/utils';
import type { RepoOutletContext } from './RepoShell.js';
import { useCommitActivity } from '../hooks/useRepoQueries.js';
import { LoadingState } from '../components/LoadingState.js';
import { ErrorState } from '../components/ErrorState.js';
import { Panel } from '../components/Panel.js';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function Activity() {
  const { repository } = useOutletContext<RepoOutletContext>();
  const activity = useCommitActivity(repository.owner.login, repository.name);

  const stats = useMemo(() => {
    const weeks = activity.data ?? [];
    if (weeks.length === 0) return null;

    const total = weeks.reduce((sum, w) => sum + w.total, 0);
    const peak = Math.max(...weeks.map((w) => w.total), 1);
    const busiest = weeks.reduce((a, b) => (b.total > a.total ? b : a));

    // Sum each weekday across the year to show when work actually happens.
    const byDay = DAY_LABELS.map((_, i) => weeks.reduce((sum, w) => sum + (w.days[i] ?? 0), 0));
    const peakDay = Math.max(...byDay, 1);

    const recent = weeks.slice(-4).reduce((sum, w) => sum + w.total, 0);
    const previous = weeks.slice(-8, -4).reduce((sum, w) => sum + w.total, 0);

    return { weeks, total, peak, busiest, byDay, peakDay, recent, previous };
  }, [activity.data]);

  if (activity.isLoading) return <LoadingState label="Building commit statistics" />;
  if (activity.isError) return <ErrorState error={activity.error} />;

  if (!stats) {
    return (
      <p className="px-8 py-12 text-center text-[13px] text-text-secondary">
        GitHub has no commit statistics for this repository.
      </p>
    );
  }

  const { weeks, total, peak, busiest, byDay, peakDay, recent, previous } = stats;
  const trend = previous === 0 ? null : Math.round(((recent - previous) / previous) * 100);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-8 py-7">
      <Panel legend="Commits per week, last 52 weeks">
        {/* Bars are absolute counts against the year's peak, not normalised. */}
        <div className="flex h-40 items-end gap-[3px]">
          {weeks.map((week) => {
            const height = (week.total / peak) * 100;
            const date = new Date(week.week * 1000);
            return (
              <div
                key={week.week}
                className="group relative flex-1 bg-accent/70 hover:bg-accent"
                style={{ height: `${Math.max(height, week.total > 0 ? 2 : 0.5)}%` }}
                title={`${week.total} commits, week of ${date.toLocaleDateString()}`}
              />
            );
          })}
        </div>
        <div className="mt-1.5 flex justify-between font-mono text-2xs text-text-muted">
          <span>{new Date(weeks[0]!.week * 1000).toLocaleDateString()}</span>
          <span className="tabular">peak {peak}/week</span>
          <span>{new Date(weeks[weeks.length - 1]!.week * 1000).toLocaleDateString()}</span>
        </div>
      </Panel>

      <div className="grid gap-6 sm:grid-cols-2">
        <Panel legend="By day of week">
          <ul className="flex flex-col gap-1.5">
            {DAY_LABELS.map((label, i) => (
              <li key={label} className="flex items-center gap-2.5">
                <span className="w-8 shrink-0 font-mono text-2xs text-text-muted">{label}</span>
                <span className="h-3 flex-1 bg-surface-2">
                  <span
                    className="block h-full bg-accent/70"
                    style={{ width: `${((byDay[i] ?? 0) / peakDay) * 100}%` }}
                  />
                </span>
                <span className="w-12 shrink-0 text-right font-mono text-2xs tabular text-text-secondary">
                  {formatCompactNumber(byDay[i] ?? 0)}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel legend="Summary">
          <dl className="flex flex-col gap-2 text-[13px]">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-text-secondary">Commits this year</dt>
              <dd className="tabular font-medium">{formatCompactNumber(total)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-text-secondary">Busiest week</dt>
              <dd className="tabular font-medium">
                {busiest.total} · {new Date(busiest.week * 1000).toLocaleDateString()}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-text-secondary">Last 4 weeks</dt>
              <dd className="tabular font-medium">{formatCompactNumber(recent)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-text-secondary">Against the 4 before</dt>
              <dd className="tabular font-medium">
                {trend === null ? '—' : `${trend > 0 ? '+' : ''}${trend}%`}
              </dd>
            </div>
          </dl>
        </Panel>
      </div>
    </div>
  );
}
