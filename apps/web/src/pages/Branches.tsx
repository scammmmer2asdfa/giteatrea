import { useOutletContext } from 'react-router-dom';
import { GitBranch, ShieldCheck } from 'lucide-react';
import { Badge } from '@repolens/ui';
import type { RepoOutletContext } from './RepoShell.js';
import { useBranches } from '../hooks/useRepoQueries.js';
import { Panel } from '../components/Panel.js';
import { LoadingState } from '../components/LoadingState.js';
import { ErrorState } from '../components/ErrorState.js';

export function Branches() {
  const { repository } = useOutletContext<RepoOutletContext>();
  const branches = useBranches(repository.owner.login, repository.name, repository.defaultBranch);

  if (branches.isLoading) return <LoadingState label="Loading branches" />;
  if (branches.isError) return <ErrorState error={branches.error} />;

  return (
    <div className="flex flex-col gap-4 p-6">
      <Panel legend={`${branches.data?.length ?? 0} branches`}>
        <ul className="flex flex-col divide-y divide-rule/60">
          {branches.data?.map((branch) => (
            <li key={branch.name} className="flex items-center gap-3 py-1.5">
              <GitBranch
                className={`h-3.5 w-3.5 shrink-0 ${branch.isDefault ? 'text-accent' : 'text-text-muted'}`}
                strokeWidth={1.75}
              />
              <span className="min-w-0 flex-1 truncate font-mono text-xs text-text-primary">
                {branch.name}
              </span>
              {branch.isDefault && <Badge tone="accent">default</Badge>}
              {branch.isProtected && (
                <Badge>
                  <ShieldCheck className="mr-1 h-3 w-3" strokeWidth={1.75} />
                  protected
                </Badge>
              )}
              <span className="w-16 shrink-0 text-right font-mono text-xs text-text-muted">
                {branch.commitSha.slice(0, 7)}
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
