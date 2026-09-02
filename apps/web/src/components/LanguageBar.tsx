import { colorForExtension } from '@repolens/graph';
import type { LanguageBreakdown } from '@repolens/types';

const EXTENSION_BY_LANGUAGE: Record<string, string> = {
  TypeScript: 'ts',
  JavaScript: 'js',
  Python: 'py',
  Ruby: 'rb',
  Go: 'go',
  Rust: 'rs',
  Java: 'java',
  Kotlin: 'kt',
  C: 'c',
  'C++': 'cpp',
  'C#': 'cs',
  PHP: 'php',
  Swift: 'swift',
  CSS: 'css',
  SCSS: 'scss',
  HTML: 'html',
  Shell: 'sh',
  Vue: 'vue',
  Svelte: 'svelte',
};

export function LanguageBar({ languages }: { languages: LanguageBreakdown }) {
  const entries = Object.entries(languages).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((sum, [, bytes]) => sum + bytes, 0);
  if (total === 0) return null;

  return (
    <div className="flex flex-col gap-2.5">
      {/* Read as a scale bar: one continuous strip, divided, no rounded ends. */}
      <div className="flex h-2.5 w-full border border-rule">
        {entries.map(([lang, bytes]) => (
          <div
            key={lang}
            style={{
              width: `${(bytes / total) * 100}%`,
              backgroundColor: colorForExtension(EXTENSION_BY_LANGUAGE[lang]),
            }}
            title={`${lang}: ${((bytes / total) * 100).toFixed(1)}%`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1">
        {entries.slice(0, 8).map(([lang, bytes]) => (
          <div key={lang} className="flex items-center gap-1.5 font-collar text-sm">
            {/* Square keys, as printed in a sheet legend. */}
            <span
              className="h-2.5 w-2.5 border border-rule"
              style={{ backgroundColor: colorForExtension(EXTENSION_BY_LANGUAGE[lang]) }}
            />
            <span className="text-text-primary">{lang}</span>
            <span className="tabular text-text-secondary">
              {((bytes / total) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
