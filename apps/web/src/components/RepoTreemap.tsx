import { useMemo, useState } from 'react';
import type { FileTreeNode } from '@repolens/types';
import { computeTreemapLayout, colorForExtension } from '@repolens/graph';
import { findFileTreeNode, formatBytes } from '@repolens/utils';
import { cn } from '@repolens/ui';
import { useElementSize } from '../hooks/useElementSize.js';

interface RepoTreemapProps {
  root: FileTreeNode;
  focusPath: string;
  onFocusChange: (path: string) => void;
  onSelectFile: (path: string) => void;
}

export function RepoTreemap({ root, focusPath, onFocusChange, onSelectFile }: RepoTreemapProps) {
  const { ref, size } = useElementSize<HTMLDivElement>();
  const [tooltip, setTooltip] = useState<{ node: FileTreeNode; x: number; y: number } | null>(null);

  const focusNode = useMemo(() => findFileTreeNode(root, focusPath) ?? root, [root, focusPath]);

  const rects = useMemo(() => {
    if (size.width === 0 || size.height === 0) return [];
    return computeTreemapLayout(focusNode, { width: size.width, height: size.height, minArea: 4 });
  }, [focusNode, size.width, size.height]);

  const breadcrumbParts = focusPath ? focusPath.split('/') : [];

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1 font-collar text-sm text-text-secondary">
        <button className="hover:text-text-primary" onClick={() => onFocusChange('')}>
          {root.name || 'root'}
        </button>
        {breadcrumbParts.map((part, index) => {
          const path = breadcrumbParts.slice(0, index + 1).join('/');
          return (
            <span key={path} className="flex items-center gap-1">
              <span className="text-structure">/</span>
              <button className="hover:text-text-primary" onClick={() => onFocusChange(path)}>
                {part}
              </button>
            </span>
          );
        })}
      </div>

      <div ref={ref} className="neatline relative min-h-0 flex-1 overflow-hidden">
        <svg width={size.width} height={size.height} className="block">
          {rects.map((rect) => {
            const width = rect.x1 - rect.x0;
            const height = rect.y1 - rect.y0;
            const isDirectory = rect.node.type === 'directory';
            const showLabel = width > 36 && height > 14;

            return (
              <g
                key={rect.node.path || 'root'}
                transform={`translate(${rect.x0}, ${rect.y0})`}
                onClick={() =>
                  isDirectory ? onFocusChange(rect.node.path) : onSelectFile(rect.node.path)
                }
                onMouseEnter={(e) => setTooltip({ node: rect.node, x: e.clientX, y: e.clientY })}
                onMouseMove={(e) => setTooltip({ node: rect.node, x: e.clientX, y: e.clientY })}
                onMouseLeave={() => setTooltip(null)}
                className="cursor-pointer"
              >
                {/* Parcels, not tiles: square corners, hairline boundaries. */}
                <rect
                  width={width}
                  height={height}
                  fill={isDirectory ? 'transparent' : colorForExtension(rect.node.extension)}
                  className={isDirectory ? 'stroke-structure' : 'stroke-surface-1'}
                  strokeWidth={1}
                />
                {showLabel && (
                  <text
                    x={4}
                    y={11}
                    fontSize={10}
                    className={cn(
                      'select-none font-collar',
                      isDirectory ? 'fill-structure-ink' : 'fill-surface-1',
                    )}
                  >
                    {rect.node.name.length > width / 5
                      ? `${rect.node.name.slice(0, Math.max(1, Math.floor(width / 5)))}\u2026`
                      : rect.node.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {tooltip && (
          <div
            className="pointer-events-none fixed z-50 border border-structure bg-surface-2 px-2 py-1"
            style={{ left: tooltip.x + 12, top: tooltip.y + 12 }}
          >
            <p className="font-mono text-xs text-text-primary">{tooltip.node.path || root.name}</p>
            <p className="font-collar text-xs tabular text-text-muted">
              {formatBytes(tooltip.node.size)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
