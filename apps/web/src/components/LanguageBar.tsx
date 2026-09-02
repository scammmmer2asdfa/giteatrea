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
      <div className="flex h-1.5 w-full overflow-hidden rounded-full">
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
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {entries.slice(0, 8).map(([lang, bytes]) => (
          <div key={lang} className="flex items-center gap-1.5 text-xs">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: colorForExtension(EXTENSION_BY_LANGUAGE[lang]) }}
            />
            <span className="text-text-primary">{lang}</span>
            <span className="tabular text-text-muted">{((bytes / total) * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
