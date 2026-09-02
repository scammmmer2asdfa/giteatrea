import { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder } from 'lucide-react';
import type { FileTreeNode } from '@repolens/types';
import { cn } from '@repolens/ui';

interface FileTreeViewProps {
  node: FileTreeNode;
  depth?: number;
  selectedPath: string | null;
  onSelectFile: (path: string) => void;
}

export function FileTreeView({ node, depth = 0, selectedPath, onSelectFile }: FileTreeViewProps) {
  const isRoot = depth === 0;
  return (
    <div>
      {!isRoot && (
        <TreeRow
          node={node}
          depth={depth}
          selectedPath={selectedPath}
          onSelectFile={onSelectFile}
        />
      )}
      {isRoot &&
        node.children?.map((child) => (
          <FileTreeView
            key={child.path}
            node={child}
            depth={1}
            selectedPath={selectedPath}
            onSelectFile={onSelectFile}
          />
        ))}
    </div>
  );
}

function TreeRow({
  node,
  depth,
  selectedPath,
  onSelectFile,
}: {
  node: FileTreeNode;
  depth: number;
  selectedPath: string | null;
  onSelectFile: (path: string) => void;
}) {
  const [expanded, setExpanded] = useState(depth <= 1);
  const isDirectory = node.type === 'directory';
  const isSelected = selectedPath === node.path;

  return (
    <div>
      <button
        onClick={() => (isDirectory ? setExpanded((v) => !v) : onSelectFile(node.path))}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
        className={cn(
          'flex w-full items-center gap-1.5 py-0.5 pr-2 text-left font-mono text-xs hover:bg-surface-2',
          isSelected ? 'bg-signal/15 text-text-primary' : 'text-text-secondary',
        )}
      >
        {isDirectory ? (
          expanded ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-structure" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-structure" />
          )
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        {isDirectory ? (
          <Folder className="h-3.5 w-3.5 shrink-0 text-structure" strokeWidth={1.75} />
        ) : (
          <File className="h-3.5 w-3.5 shrink-0 text-text-muted" strokeWidth={1.75} />
        )}
        <span className="truncate">{node.name}</span>
      </button>
      {isDirectory &&
        expanded &&
        node.children?.map((child) => (
          <TreeRow
            key={child.path}
            node={child}
            depth={depth + 1}
            selectedPath={selectedPath}
            onSelectFile={onSelectFile}
          />
        ))}
    </div>
  );
}
