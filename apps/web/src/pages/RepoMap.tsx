import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import type { RepoOutletContext } from './RepoShell.js';
import { useFileTree } from '../hooks/useRepoQueries.js';
import { LoadingState } from '../components/LoadingState.js';
import { ErrorState } from '../components/ErrorState.js';
import { RepoTreemap } from '../components/RepoTreemap.js';

export function RepoMap() {
  const { repository } = useOutletContext<RepoOutletContext>();
  const navigate = useNavigate();
  const [focusPath, setFocusPath] = useState('');
  const tree = useFileTree(repository.owner.login, repository.name, repository.defaultBranch);

  if (tree.isLoading) return <LoadingState label="Loading repository map…" />;
  if (tree.isError) return <ErrorState error={tree.error} />;
  if (!tree.data) return null;

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <div>
        <h1 className="text-sm font-semibold text-text-primary">Repository Map</h1>
        <p className="text-xs text-text-secondary">
          Every file, sized by bytes. Click a folder to zoom in, click a file to open it.
        </p>
      </div>
      <div className="min-h-0 flex-1">
        <RepoTreemap
          root={tree.data}
          focusPath={focusPath}
          onFocusChange={setFocusPath}
          onSelectFile={(path) =>
            navigate(`/${repository.owner.login}/${repository.name}/files/${path}`)
          }
        />
      </div>
    </div>
  );
}
