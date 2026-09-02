import { describe, expect, it } from 'vitest';
import { computeTreemapLayout } from '../src/treemap.js';
import type { FileTreeNode } from '@repolens/types';

describe('computeTreemapLayout', () => {
  it('lays out files within the given bounds', () => {
    const root: FileTreeNode = {
      name: '',
      path: '',
      type: 'directory',
      size: 300,
      children: [
        { name: 'a.ts', path: 'a.ts', type: 'file', size: 100 },
        { name: 'b.ts', path: 'b.ts', type: 'file', size: 200 },
      ],
    };

    const rects = computeTreemapLayout(root, { width: 400, height: 300 });

    expect(rects.length).toBe(2);
    for (const rect of rects) {
      expect(rect.x0).toBeGreaterThanOrEqual(0);
      expect(rect.y0).toBeGreaterThanOrEqual(0);
      expect(rect.x1).toBeLessThanOrEqual(400);
      expect(rect.y1).toBeLessThanOrEqual(300);
    }
  });
});
