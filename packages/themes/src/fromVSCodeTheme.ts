import { darken, ensureContrast, isValidHexColor, lighten } from './color.js';
import type { Theme, ThemeColors, VSCodeThemeFile } from './types.js';

export class InvalidVSCodeThemeError extends Error {}

function pickColor(colors: Record<string, string>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = colors[key];
    if (value && isValidHexColor(value)) return value;
  }
  return undefined;
}

/**
 * Derives RepoLens's design tokens from a standard VS Code color theme file
 * (the same `colors` map published by every theme extension on the
 * marketplace). Missing keys are approximated from nearby ones so even
 * minimal theme files produce a usable result.
 */
export function fromVSCodeTheme(file: VSCodeThemeFile, id: string): Theme {
  const colors = file.colors ?? {};

  const surface1 =
    pickColor(colors, ['editor.background', 'sideBar.background', 'activityBar.background']) ??
    '#1e1e1e';
  const surface2 =
    pickColor(colors, [
      'sideBar.background',
      'editorGroupHeader.tabsBackground',
      'activityBar.background',
    ]) ?? lighten(surface1, 0.04);
  const surface3 =
    pickColor(colors, [
      'editorWidget.background',
      'dropdown.background',
      'input.background',
      'menu.background',
    ]) ?? lighten(surface1, 0.09);
  const border =
    pickColor(colors, [
      'panel.border',
      'sideBar.border',
      'widget.border',
      'editorGroup.border',
      'focusBorder',
    ]) ?? lighten(surface1, 0.16);
  const textPrimary = pickColor(colors, ['editor.foreground', 'foreground']) ?? '#d4d4d4';
  const textSecondary =
    pickColor(colors, ['descriptionForeground', 'sideBar.foreground', 'tab.inactiveForeground']) ??
    darken(textPrimary, 0.25);
  const textMuted =
    pickColor(colors, [
      'disabledForeground',
      'tab.inactiveForeground',
      'editorLineNumber.foreground',
    ]) ?? darken(textPrimary, 0.45);

  // Structure is the theme's own linework: borders and focus rings, not its brand color.
  const structure = border;
  // Signal keeps its meaning across imports by reading the theme's "added/changed"
  // colors — the closest thing every VS Code theme has to "this is new".
  const signal =
    pickColor(colors, [
      'gitDecoration.addedResourceForeground',
      'editorGutter.addedBackground',
      'charts.green',
      'terminal.ansiGreen',
    ]) ?? '#8fa890';

  const colorsResult: ThemeColors = {
    surface1,
    surface2,
    surface3,
    structure,
    structureInk: ensureContrast(structure, surface1),
    textPrimary,
    textSecondary: ensureContrast(textSecondary, surface1, 4.5),
    textMuted: ensureContrast(textMuted, surface1, 3),
    signal,
    signalInk: ensureContrast(signal, surface1),
  };

  return {
    id,
    name: file.name?.trim() || 'Imported theme',
    kind: file.type === 'light' || file.type === 'hc-light' ? 'light' : 'dark',
    source: 'vscode-import',
    colors: colorsResult,
  };
}

/** Parses and validates raw JSON text as a VS Code theme file before converting it. */
export function parseVSCodeThemeJson(raw: string, id: string): Theme {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new InvalidVSCodeThemeError('Not valid JSON.');
  }
  if (typeof parsed !== 'object' || parsed === null) {
    throw new InvalidVSCodeThemeError('Theme file must be a JSON object.');
  }
  const file = parsed as VSCodeThemeFile;
  if (!file.colors || typeof file.colors !== 'object') {
    throw new InvalidVSCodeThemeError('Theme file is missing a "colors" object.');
  }
  return fromVSCodeTheme(file, id);
}
