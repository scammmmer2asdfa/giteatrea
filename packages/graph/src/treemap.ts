import { hierarchy, treemap, treemapSquarify } from 'd3-hierarchy';
import type { FileTreeNode } from '@repolens/types';

export interface TreemapRect {
  node: FileTreeNode;
  depth: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface TreemapOptions {
  width: number;
  height: number;
  paddingInner?: number;
  paddingOuter?: number;
  /** Only rectangles at or below this pixel area are dropped (keeps tiny files from cluttering the map). */
  minArea?: number;
}

/**
 * Lays out a file tree as a squarified treemap, sized by file byte size.
 * Returns every visible node (directories included) as an axis-aligned rect.
 */
export function computeTreemapLayout(root: FileTreeNode, options: TreemapOptions): TreemapRect[] {
  const { width, height, paddingInner = 2, paddingOuter = 2, minArea = 0 } = options;

  const hierarchyRoot = hierarchy<FileTreeNode>(root, (d) => d.children)
    .sum((d) => (d.children && d.children.length > 0 ? 0 : Math.max(d.size, 1)))
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

  const layout = treemap<FileTreeNode>()
    .tile(treemapSquarify)
    .size([width, height])
    .paddingInner(paddingInner)
    .paddingOuter(paddingOuter)
    .round(true);

  const laidOut = layout(hierarchyRoot);

  const rects: TreemapRect[] = [];
  laidOut.each((node) => {
    if (node.depth === 0) return; // skip synthetic root
    const area = (node.x1 - node.x0) * (node.y1 - node.y0);
    if (area < minArea) return;
    rects.push({
      node: node.data,
      depth: node.depth,
      x0: node.x0,
      y0: node.y0,
      x1: node.x1,
      y1: node.y1,
    });
  });

  return rects;
}
