import { Outlet, useParams } from 'react-router-dom';
import type { Repository } from '@repolens/types';
import { Sidebar } from '../components/Sidebar.js';
import { TopBar } from '../components/TopBar.js';
import { useRepository } from '../hooks/useRepoQueries.js';
import { LoadingState } from '../components/LoadingState.js';
import { ErrorState } from '../components/ErrorState.js';

export interface RepoOutletContext {
  repository: Repository;
}

export function RepoShell() {
  const { owner = '', repo = '' } = useParams<{ owner: string; repo: string }>();
  const { data: repository, isLoading, isError, error } = useRepository(owner, repo);

  return (
    <div className="flex h-screen flex-col bg-surface text-text-primary">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          {isLoading && <LoadingState label={`Loading ${owner}/${repo}…`} />}
          {isError && <ErrorState error={error} />}
          {repository && <Outlet context={{ repository } satisfies RepoOutletContext} />}
        </main>
      </div>
    </div>
  );
}
