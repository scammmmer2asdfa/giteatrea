import { hexToRgbTriplet } from './color.js';
import type { Theme } from './types.js';

/** Maps a theme onto the CSS custom properties the stylesheet reads. */
export function themeToCssVars(theme: Theme): Record<string, string> {
  const { colors } = theme;
  return {
    '--rl-surface-1': hexToRgbTriplet(colors.surface1),
    '--rl-surface-2': hexToRgbTriplet(colors.surface2),
    '--rl-surface-3': hexToRgbTriplet(colors.surface3),
    '--rl-structure': hexToRgbTriplet(colors.structure),
    '--rl-structure-ink': hexToRgbTriplet(colors.structureInk),
    '--rl-ink-1': hexToRgbTriplet(colors.textPrimary),
    '--rl-ink-2': hexToRgbTriplet(colors.textSecondary),
    '--rl-ink-3': hexToRgbTriplet(colors.textMuted),
    '--rl-signal': hexToRgbTriplet(colors.signal),
    '--rl-signal-ink': hexToRgbTriplet(colors.signalInk),
  };
}
