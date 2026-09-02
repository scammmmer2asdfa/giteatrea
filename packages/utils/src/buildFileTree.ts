import type { FileTreeEntry, FileTreeNode } from '@repolens/types';
import { getFileExtension } from './format.js';

/**
 * Converts a flat list of git tree entries (as returned by the GitHub "get tree
 * recursively" API) into a nested hierarchy suitable for tree/treemap views.
 */
export function buildFileTree(entries: FileTreeEntry[], rootName = ''): FileTreeNode {
  const root: FileTreeNode = { name: rootName, path: '', type: 'directory', size: 0, children: [] };

  for (const entry of entries) {
    if (entry.type === 'commit') continue; // submodule, skip
    const parts = entry.path.split('/');
    let current = root;
    let accumulatedPath = '';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!part) continue;
      accumulatedPath = accumulatedPath ? `${accumulatedPath}/${part}` : part;
      const isLast = i === parts.length - 1;

      if (isLast && entry.type === 'blob') {
        current.children ??= [];
        current.children.push({
          name: part,
          path: accumulatedPath,
          type: 'file',
          size: entry.size ?? 0,
          extension: getFileExtension(part),
        });
        continue;
      }

      current.children ??= [];
      const existing = current.children.find((c) => c.name === part && c.type === 'directory');
      const next: FileTreeNode = existing ?? {
        name: part,
        path: accumulatedPath,
        type: 'directory',
        size: 0,
        children: [],
      };
      if (!existing) current.children.push(next);
      current = next;
    }
  }

  sumSizes(root);
  sortTree(root);
  return root;
}

function sumSizes(node: FileTreeNode): number {
  if (node.type === 'file') return node.size;
  const total = (node.children ?? []).reduce((sum, child) => sum + sumSizes(child), 0);
  node.size = total;
  return total;
}

function sortTree(node: FileTreeNode): void {
  if (!node.children) return;
  node.children.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  node.children.forEach(sortTree);
}
