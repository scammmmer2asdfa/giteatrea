/**
 * A curated color palette for common languages/extensions, loosely inspired
 * by GitHub's linguist colors. Falls back to a deterministic hashed hue for
 * anything not in the table so the map never renders unstyled gray blobs.
 */
const EXTENSION_COLORS: Record<string, string> = {
  ts: '#3178c6',
  tsx: '#3178c6',
  js: '#f1e05a',
  jsx: '#f1e05a',
  mjs: '#f1e05a',
  cjs: '#f1e05a',
  json: '#8bc34a',
  py: '#3572A5',
  rb: '#701516',
  go: '#00ADD8',
  rs: '#dea584',
  java: '#b07219',
  kt: '#A97BFF',
  c: '#555555',
  h: '#555555',
  cpp: '#f34b7d',
  hpp: '#f34b7d',
  cs: '#178600',
  php: '#4F5D95',
  swift: '#F05138',
  css: '#563d7c',
  scss: '#c6538c',
  html: '#e34c26',
  md: '#083fa1',
  mdx: '#083fa1',
  yml: '#cb171e',
  yaml: '#cb171e',
  toml: '#9c4221',
  sh: '#89e051',
  bash: '#89e051',
  sql: '#e38c00',
  vue: '#41b883',
  svelte: '#ff3e00',
  graphql: '#e10098',
  dockerfile: '#384d54',
  lock: '#6e7681',
};

const DIRECTORY_COLOR = '#30363d';
const FALLBACK_HUE_SATURATION = { s: 45, l: 55 };

export function colorForExtension(extension: string | undefined): string {
  if (!extension) return DIRECTORY_COLOR;
  const known = EXTENSION_COLORS[extension.toLowerCase()];
  if (known) return known;
  return hashedColor(extension);
}

function hashedColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const hue = Math.abs(hash) % 360;
  const { s, l } = FALLBACK_HUE_SATURATION;
  return `hsl(${hue}, ${s}%, ${l}%)`;
}

export function colorForDirectory(): string {
  return DIRECTORY_COLOR;
}
