/** The token set RepoLens renders with — every theme (built-in or imported) must fill these in. */
export interface ThemeColors {
  /** Page ground. */
  surface1: string;
  /** Panels and inputs, one step off the ground. */
  surface2: string;
  /** Raised or selected rows. */
  surface3: string;
  /** Hairlines and field borders. */
  rule: string;
  /** Heavier dividers and scrollbar thumbs. */
  ruleStrong: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  /** The one hue in the system: selection, recency, primary actions. */
  accent: string;
  /** The same hue adjusted to clear 4.5:1 on the ground, for accent text and links. */
  accentInk: string;
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
