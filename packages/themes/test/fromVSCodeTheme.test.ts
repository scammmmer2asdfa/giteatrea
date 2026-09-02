import { describe, expect, it } from 'vitest';
import { fromVSCodeTheme, parseVSCodeThemeJson, InvalidVSCodeThemeError } from '../src/index.js';
import { contrastRatio } from '../src/color.js';

// A realistic slice of a published VS Code theme (Dracula's colour keys).
const dracula = {
  name: 'Dracula',
  type: 'dark' as const,
  colors: {
    'editor.background': '#282a36',
    'editor.foreground': '#f8f8f2',
    'sideBar.background': '#21222c',
    'input.background': '#282a36',
    'panel.border': '#bd93f9',
    descriptionForeground: '#6272a4',
    'button.background': '#44475a',
    'textLink.foreground': '#8be9fd',
  },
};

describe('fromVSCodeTheme', () => {
  it('maps a published theme onto every RepoLens token', () => {
    const theme = fromVSCodeTheme(dracula, 'vscode-dracula');
    expect(theme.name).toBe('Dracula');
    expect(theme.kind).toBe('dark');
    expect(theme.source).toBe('vscode-import');
    expect(theme.colors.surface1).toBe('#282a36');
    expect(theme.colors.textPrimary).toBe('#f8f8f2');
    // Every token must be filled, or the stylesheet renders unstyled.
    for (const [key, value] of Object.entries(theme.colors)) {
      expect(value, `${key} should be a colour`).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('forces accent and body text to stay readable on the theme ground', () => {
    const theme = fromVSCodeTheme(dracula, 'vscode-dracula');
    const { surface1, textSecondary, accentInk } = theme.colors;
    expect(contrastRatio(textSecondary, surface1)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(accentInk, surface1)).toBeGreaterThanOrEqual(4.5);
  });

  it('treats a light theme as light', () => {
    const theme = fromVSCodeTheme({ ...dracula, type: 'light' }, 'x');
    expect(theme.kind).toBe('light');
  });

  it('falls back rather than throwing when optional keys are absent', () => {
    const theme = fromVSCodeTheme(
      { name: 'Bare', colors: { 'editor.background': '#101010' } },
      'b',
    );
    expect(theme.colors.surface1).toBe('#101010');
    expect(theme.colors.accent).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('rejects files that are not themes', () => {
    expect(() => parseVSCodeThemeJson('not json', 'x')).toThrow(InvalidVSCodeThemeError);
    expect(() => parseVSCodeThemeJson('{"name":"no colours"}', 'x')).toThrow(
      InvalidVSCodeThemeError,
    );
  });
});
