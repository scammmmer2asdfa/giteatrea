/** The token set RepoLens actually renders with — every theme (built-in or imported) must fill these in. */
export interface ThemeColors {
  surface1: string;
  surface2: string;
  surface3: string;
  /** Non-repro blue: frames, hairlines, dotted leaders. Scaffolding you look through. */
  structure: string;
  /** The same blue raised to pass 4.5:1, for collar labels and other small structural text. */
  structureInk: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  /** Checker's green: recency, confirmed, current. Large fills and highlights. */
  signal: string;
  /** The same green adjusted to pass 4.5:1, for signal text and links. */
  signalInk: string;
}

export type ThemeKind = 'dark' | 'light';
export type ThemeSource = 'built-in' | 'vscode-import';

export interface Theme {
  id: string;
  name: string;
  kind: ThemeKind;
  source: ThemeSource;
  colors: ThemeColors;
}

/**
 * Minimal shape of a VS Code color theme file (the JSON referenced by a theme
 * extension's `contributes.themes`). Only the fields RepoLens reads are
 * declared; real theme files contain many more.
 */
export interface VSCodeThemeFile {
  name?: string;
  type?: 'dark' | 'light' | 'hc-black' | 'hc-light';
  colors?: Record<string, string>;
}
