import { useOutletContext } from 'react-router-dom';
import { GitBranch, ShieldCheck } from 'lucide-react';
import { Badge, cn } from '@repolens/ui';
import type { RepoOutletContext } from './RepoShell.js';
import { useBranches } from '../hooks/useRepoQueries.js';
import { CollarBlock } from '../components/Collar.js';
import { LoadingState } from '../components/LoadingState.js';
import { ErrorState } from '../components/ErrorState.js';

export function Branches() {
  const { repository } = useOutletContext<RepoOutletContext>();
  const branches = useBranches(repository.owner.login, repository.name, repository.defaultBranch);

  if (branches.isLoading) return <LoadingState label="Loading branches…" />;
  if (branches.isError) return <ErrorState error={branches.error} />;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-8 py-7">
      <CollarBlock caption="Sheets">
        <ul className="flex flex-col divide-y divide-rule/40">
          {branches.data?.map((branch) => (
            <li key={branch.name} className="flex items-center gap-3 py-1.5">
              <GitBranch
                className={cn(
                  'h-3.5 w-3.5 shrink-0',
                  branch.isDefault ? 'text-signal-ink' : 'text-structure',
                )}
                strokeWidth={1.75}
              />
              <span className="flex-1 truncate font-mono text-sm text-text-primary">
                {branch.name}
              </span>
              {branch.isDefault && <Badge tone="current">Current</Badge>}
              {branch.isProtected && (
                <Badge tone="neutral">
                  <ShieldCheck className="mr-1 h-3 w-3" strokeWidth={1.75} /> Protected
                </Badge>
              )}
              <span className="font-mono text-xs text-text-muted">
                {branch.commitSha.slice(0, 7)}
              </span>
            </li>
          ))}
        </ul>
      </CollarBlock>
    </div>
  );
}
