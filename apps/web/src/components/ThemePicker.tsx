import { useRef, useState } from 'react';
import { Check, Trash2, Upload } from 'lucide-react';
import { cn } from '@repolens/ui';
import { InvalidVSCodeThemeError, parseVSCodeThemeJson, type Theme } from '@repolens/themes';
import { useAllThemes, useThemeStore } from '../store/theme-store.js';

/** Six-swatch preview so a theme can be judged without applying it. */
function Swatches({ theme }: { theme: Theme }) {
  const { colors } = theme;
  const order = [
    colors.surface1,
    colors.surface2,
    colors.surface3,
    colors.rule,
    colors.textSecondary,
    colors.accent,
  ];
  return (
    <span className="flex overflow-hidden rounded-control border border-rule">
      {order.map((color, i) => (
        <span key={i} className="h-5 w-4" style={{ backgroundColor: color }} />
      ))}
    </span>
  );
}

export function ThemePicker() {
  const themes = useAllThemes();
  const activeId = useThemeStore((s) => s.activeThemeId);
  const setActive = useThemeStore((s) => s.setActiveTheme);
  const install = useThemeStore((s) => s.installTheme);
  const remove = useThemeStore((s) => s.removeTheme);
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    try {
      const text = await file.text();
      const id = `vscode-${file.name.replace(/\.json$/i, '').toLowerCase()}`;
      install(parseVSCodeThemeJson(text, id));
    } catch (e) {
      setError(
        e instanceof InvalidVSCodeThemeError
          ? e.message
          : 'Could not read that file as a VS Code theme.',
      );
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-[13px] font-medium text-text-primary">Theme</h2>
        <p className="mt-0.5 text-xs text-text-secondary">
          Import any VS Code colour theme file and RepoLens will map it onto its own tokens,
          darkening or lightening colours where needed to stay readable.
        </p>
      </div>

      <ul className="divide-y divide-rule border-y border-rule">
        {themes.map((theme) => {
          const isActive = theme.id === activeId;
          return (
            <li key={theme.id} className="flex items-center gap-3 py-2">
              <button
                onClick={() => setActive(theme.id)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <span
                  className={cn(
                    'grid h-4 w-4 shrink-0 place-items-center rounded-full border',
                    isActive ? 'border-accent bg-accent' : 'border-rule-strong',
                  )}
                >
                  {isActive && <Check className="h-2.5 w-2.5 text-black" strokeWidth={3} />}
                </span>
                <Swatches theme={theme} />
                <span className="min-w-0 flex-1 truncate text-[13px] text-text-primary">
                  {theme.name}
                </span>
                <span className="shrink-0 text-2xs text-text-muted">
                  {theme.source === 'built-in' ? theme.kind : 'imported'}
                </span>
              </button>
              {theme.source === 'vscode-import' && (
                <button
                  onClick={() => remove(theme.id)}
                  className="shrink-0 text-text-muted hover:text-accent-ink"
                  aria-label={`Remove ${theme.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = '';
          }}
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="inline-flex h-8 items-center gap-1.5 rounded-control border border-rule px-3 text-xs text-text-primary hover:bg-surface-2"
        >
          <Upload className="h-3.5 w-3.5" />
          Import a VS Code theme
        </button>
        <span className="text-2xs text-text-muted">
          The <code className="font-mono">.json</code> from a theme extension
        </span>
      </div>

      {error && <p className="text-xs text-accent-ink">{error}</p>}
    </section>
  );
}
