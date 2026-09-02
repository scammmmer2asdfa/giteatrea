import type { Theme, ThemeColors } from './types.js';

/**
 * Graphite: the drafting table itself. Non-repro blue for construction lines
 * (blueprint cameras couldn't see that wavelength, so blue meant "structure,
 * not part of the final print"), checker's green for values verified against
 * the calculations.
 *
 * Contrast against the #2b2d30 ground, sRGB, computed not eyeballed:
 *   ink 11.8:1 · structureInk 5.3:1 · signal 5.4:1
 *   structure #4a90c4 is 4.0:1 — linework only, never small text.
 */
const graphiteColors: ThemeColors = {
  surface1: '#2b2d30',
  surface2: '#313438',
  surface3: '#393c41',
  structure: '#4a90c4',
  structureInk: '#6ba6d4',
  textPrimary: '#ededea',
  textSecondary: '#a8a9a3',
  textMuted: '#8b8c85',
  signal: '#8fa890',
  signalInk: '#8fa890',
};

/**
 * Vellum: the same drafting logic on a pale sheet. The dark values are not
 * reused — #8fa890 washes out on a light ground, so both blue and green are
 * darkened until they hold their own.
 */
const vellumColors: ThemeColors = {
  surface1: '#f1efe9',
  surface2: '#e9e6de',
  surface3: '#dfdbd1',
  structure: '#2e6390',
  structureInk: '#2e6390',
  textPrimary: '#2a2a26',
  textSecondary: '#55564f',
  textMuted: '#6f7068',
  signal: '#5f7a62',
  signalInk: '#4f6852',
};

/**
 * The only two themes shipped inside the client bundle. Every other theme
 * (VS Code catalog imports) is fetched from @repolens/api on demand and
 * cached locally once a user "installs" it.
 */
export const BUILT_IN_THEMES: Theme[] = [
  { id: 'graphite', name: 'Graphite', kind: 'dark', source: 'built-in', colors: graphiteColors },
  { id: 'vellum', name: 'Vellum', kind: 'light', source: 'built-in', colors: vellumColors },
];

export const DEFAULT_THEME_ID = 'graphite';
