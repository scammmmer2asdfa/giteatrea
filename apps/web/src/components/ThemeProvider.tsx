import { useEffect } from 'react';
import { themeToCssVars } from '@repolens/themes';
import { useActiveTheme } from '../store/theme-store.js';

/** Writes the active theme's tokens onto :root so every component follows it. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useActiveTheme();

  useEffect(() => {
    const root = document.documentElement;
    const vars = themeToCssVars(theme);
    for (const [name, value] of Object.entries(vars)) {
      root.style.setProperty(name, value);
    }
    // Drives Tailwind's dark: variant and the native form-control palette.
    root.dataset.panel = theme.kind;
    root.style.colorScheme = theme.kind;
  }, [theme]);

  return <>{children}</>;
}
