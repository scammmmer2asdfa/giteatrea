import type { FileTreeNode } from '@repolens/types';

/** Finds a node in a file tree by its slash-delimited path ("" or the root's own path returns the root). */
export function findFileTreeNode(root: FileTreeNode, path: string): FileTreeNode | null {
  if (path === '' || path === root.path) return root;
  const parts = path.split('/');
  let current: FileTreeNode = root;
  for (const part of parts) {
    const next = current.children?.find((c) => c.name === part);
    if (!next) return null;
    current = next;
  }
  return current;
}
