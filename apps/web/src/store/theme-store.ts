import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BUILT_IN_THEMES, DEFAULT_THEME_ID, type Theme } from '@repolens/themes';

interface ThemeState {
  activeThemeId: string;
  /** Themes imported from VS Code theme files, kept in localStorage. */
  installed: Theme[];
  setActiveTheme: (id: string) => void;
  installTheme: (theme: Theme) => void;
  removeTheme: (id: string) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      activeThemeId: DEFAULT_THEME_ID,
      installed: [],
      setActiveTheme: (activeThemeId) => set({ activeThemeId }),
      installTheme: (theme) =>
        set((s) => ({
          installed: [...s.installed.filter((t) => t.id !== theme.id), theme],
          activeThemeId: theme.id,
        })),
      removeTheme: (id) =>
        set((s) => ({
          installed: s.installed.filter((t) => t.id !== id),
          // Removing the theme you're wearing must not leave the app unstyled.
          activeThemeId: s.activeThemeId === id ? DEFAULT_THEME_ID : s.activeThemeId,
        })),
    }),
    { name: 'repolens-theme' },
  ),
);

export function useAllThemes(): Theme[] {
  const installed = useThemeStore((s) => s.installed);
  return [...BUILT_IN_THEMES, ...installed];
}

export function useActiveTheme(): Theme {
  const id = useThemeStore((s) => s.activeThemeId);
  const all = useAllThemes();
  return all.find((t) => t.id === id) ?? BUILT_IN_THEMES[0]!;
}
