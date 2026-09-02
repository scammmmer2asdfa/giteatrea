import { hexToRgbTriplet } from './color.js';
import type { Theme } from './types.js';

/** Maps a theme onto the CSS custom properties the stylesheet reads. */
export function themeToCssVars(theme: Theme): Record<string, string> {
  const { colors } = theme;
  return {
    '--rl-surface-1': hexToRgbTriplet(colors.surface1),
    '--rl-surface-2': hexToRgbTriplet(colors.surface2),
    '--rl-surface-3': hexToRgbTriplet(colors.surface3),
    '--rl-rule': hexToRgbTriplet(colors.rule),
    '--rl-rule-strong': hexToRgbTriplet(colors.ruleStrong),
    '--rl-ink-1': hexToRgbTriplet(colors.textPrimary),
    '--rl-ink-2': hexToRgbTriplet(colors.textSecondary),
    '--rl-ink-3': hexToRgbTriplet(colors.textMuted),
    '--rl-accent': hexToRgbTriplet(colors.accent),
    '--rl-accent-ink': hexToRgbTriplet(colors.accentInk),
  };
}
