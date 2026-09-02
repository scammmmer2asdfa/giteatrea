import { useEffect, useMemo, useRef, useState } from 'react';
import { computeTreemapLayout, colorForExtension } from '@repolens/graph';
import { buildFileTree } from '@repolens/utils';
import type { FileTreeEntry } from '@repolens/types';

// A representative repository shape. Rendered by the same layout code the
// product uses, so this is the real renderer rather than a screenshot.
const SAMPLE: [string, number][] = [
  ['src/core/scheduler.ts', 41000],
  ['src/core/runtime.ts', 38000],
  ['src/core/reconciler.ts', 52000],
  ['src/core/hooks.ts', 24000],
  ['src/core/context.ts', 12000],
  ['src/compiler/parser.ts', 47000],
  ['src/compiler/emit.ts', 31000],
  ['src/compiler/optimize.ts', 22000],
  ['src/compiler/tokens.ts', 9000],
  ['src/dom/events.ts', 26000],
  ['src/dom/render.ts', 21000],
  ['src/dom/attributes.ts', 11000],
  ['src/server/stream.ts', 19000],
  ['src/server/hydrate.ts', 14000],
  ['src/shared/invariant.ts', 4000],
  ['src/shared/flags.ts', 6000],
  ['test/scheduler.test.ts', 28000],
  ['test/reconciler.test.ts', 34000],
  ['test/compiler.test.ts', 25000],
  ['test/dom.test.ts', 17000],
  ['docs/architecture.md', 15000],
  ['docs/api.md', 12000],
  ['docs/upgrading.md', 7000],
  ['scripts/build.js', 8000],
  ['scripts/release.js', 5000],
  ['package.json', 2000],
  ['README.md', 6000],
];

const entries: FileTreeEntry[] = SAMPLE.map(([path, size]) => ({
  path,
  type: 'blob',
  sha: path,
  size,
  mode: '100644',
  url: '',
}));

export function HeroMap() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  // Laid out at the container's real size so the map fills the frame instead
  // of being letterboxed by preserveAspectRatio or clipped by padding.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const rects = useMemo(() => {
    if (size.width === 0 || size.height === 0) return [];
    const tree = buildFileTree(entries, 'repository');
    return computeTreemapLayout(tree, { ...size, minArea: 12 });
  }, [size]);

  return (
    <div ref={ref} className="h-full w-full">
      <svg
        width={size.width}
        height={size.height}
        className="block"
        role="img"
        aria-label="A repository rendered as a treemap, with each file sized by its byte count"
      >
      {rects.map((rect) => {
        const w = rect.x1 - rect.x0;
        const h = rect.y1 - rect.y0;
        const isDir = rect.node.type === 'directory';
        return (
          <g key={rect.node.path} transform={`translate(${rect.x0},${rect.y0})`}>
            <rect
              width={w}
              height={h}
              fill={isDir ? 'transparent' : colorForExtension(rect.node.extension)}
              fillOpacity={isDir ? 0 : 0.85}
              className={isDir ? 'stroke-rule-strong' : 'stroke-surface-1'}
              strokeWidth={isDir ? 1 : 1}
            />
            {isDir && w > 60 && (
              <text x={5} y={12} fontSize={10} className="fill-text-muted font-mono">
                {rect.node.name}
              </text>
            )}
            {!isDir && w > 52 && h > 16 && (
              <text x={5} y={13} fontSize={9.5} className="fill-black/80 font-mono">
                {rect.node.name.length > w / 5.4
                  ? `${rect.node.name.slice(0, Math.max(1, Math.floor(w / 5.4)))}…`
                  : rect.node.name}
              </text>
            )}
          </g>
        );
      })}
      </svg>
    </div>
  );
}
