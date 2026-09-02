import type { Theme, ThemeColors } from './types.js';

/**
 * Graphite: neutral machined grays with a single orange. The grays carry no
 * hue of their own so the orange never has to compete for attention.
 *
 * Contrast against the #131316 ground, sRGB, computed not eyeballed:
 *   textPrimary 16.6:1 · textSecondary 7.2:1 · textMuted 5.1:1 · accent 6.5:1
 */
const graphiteColors: ThemeColors = {
  surface1: '#131316',
  surface2: '#1a1a1e',
  surface3: '#232328',
  rule: '#2e2e34',
  ruleStrong: '#3e3e46',
  textPrimary: '#f0f0f2',
  textSecondary: '#a0a0a8',
  textMuted: '#85858f',
  accent: '#ff6b1a',
  accentInk: '#ff8a47',
};

/**
 * Paper: the same structure on a light ground. The orange is darkened rather
 * than reused — #ff6b1a only reaches 2.3:1 on white and fails outright.
 */
const paperColors: ThemeColors = {
  surface1: '#ffffff',
  surface2: '#f6f6f7',
  surface3: '#ececee',
  rule: '#d9d9dd',
  ruleStrong: '#bcbcc2',
  textPrimary: '#16161a',
  textSecondary: '#5a5a62',
  textMuted: '#707079',
  accent: '#c74a08',
  accentInk: '#b04006',
};

/**
 * The only two themes shipped inside the client bundle. Every other theme
 * (VS Code catalog imports) is fetched from @repolens/api on demand and
 * cached locally once a user "installs" it.
 */
export const BUILT_IN_THEMES: Theme[] = [
  { id: 'graphite', name: 'Graphite', kind: 'dark', source: 'built-in', colors: graphiteColors },
  { id: 'paper', name: 'Paper', kind: 'light', source: 'built-in', colors: paperColors },
];

export const DEFAULT_THEME_ID = 'graphite';
