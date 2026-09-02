import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { findFileTreeNode, formatBytes } from '@repolens/utils';
import type { RepoOutletContext } from './RepoShell.js';
import { useFileContent, useFileTree } from '../hooks/useRepoQueries.js';
import { FileTreeView } from '../components/FileTreeView.js';
import { LoadingState } from '../components/LoadingState.js';
import { ErrorState } from '../components/ErrorState.js';

const MAX_PREVIEW_BYTES = 1_000_000;

export function Files() {
  const { repository } = useOutletContext<RepoOutletContext>();
  const params = useParams<{ '*': string }>();
  const navigate = useNavigate();
  const selectedPath = params['*'] ? decodeURIComponent(params['*']) : null;
  const base = `/${repository.owner.login}/${repository.name}/files`;

  const tree = useFileTree(repository.owner.login, repository.name, repository.defaultBranch);
  const selectedNode = tree.data && selectedPath ? findFileTreeNode(tree.data, selectedPath) : null;
  const tooLarge = Boolean(selectedNode && selectedNode.size > MAX_PREVIEW_BYTES);

  const fileContent = useFileContent(
    repository.owner.login,
    repository.name,
    tooLarge ? null : selectedPath,
    repository.defaultBranch,
  );

  if (tree.isLoading) return <LoadingState label="Loading files…" />;
  if (tree.isError) return <ErrorState error={tree.error} />;
  if (!tree.data) return null;

  return (
    <div className="flex h-full">
      <div className="w-72 shrink-0 overflow-auto border-r border-rule py-2">
        <FileTreeView
          node={tree.data}
          selectedPath={selectedPath}
          onSelectFile={(path) => navigate(`${base}/${path}`)}
        />
      </div>
      <div className="min-w-0 flex-1 overflow-auto">
        {!selectedPath && (
          <div className="flex h-full items-center justify-center text-base text-text-secondary">
            Pick a file to read it.
          </div>
        )}
        {selectedPath && selectedNode && (
          <div className="flex flex-col">
            <div className="sticky top-0 flex items-center justify-between border-b border-rule bg-surface-1 px-4 py-1.5">
              <p className="truncate font-mono text-xs text-text-primary">{selectedPath}</p>
              <span className="shrink-0 font-mono text-xs tabular text-text-muted">
                {formatBytes(selectedNode.size)}
              </span>
            </div>
            {tooLarge && (
              <p className="p-4 text-base text-text-secondary">
                This file is {formatBytes(selectedNode.size)} — too large to read here.{' '}
                <a
                  className="link"
                  href={`https://github.com/${repository.fullName}/blob/${repository.defaultBranch}/${selectedPath}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open it on GitHub
                </a>
              </p>
            )}
            {!tooLarge && fileContent.isLoading && <LoadingState label="Loading file…" />}
            {!tooLarge && fileContent.isError && <ErrorState error={fileContent.error} />}
            {!tooLarge && fileContent.data !== undefined && (
              <pre className="overflow-auto p-4 font-mono text-xs leading-5 text-text-primary">
                <code>{fileContent.data}</code>
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
