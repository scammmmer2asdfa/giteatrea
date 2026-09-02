import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, ExternalLink, ScanSearch } from 'lucide-react';
import { Kbd } from '@repolens/ui';
import { parseGitHubInput } from '@repolens/utils';

export function TopBar() {
  const { owner, repo } = useParams<{ owner: string; repo: string }>();
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA';
      if (event.key === '/' && !isTyping) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = parseGitHubInput(value);
    if (parsed?.type === 'repo') {
      navigate(`/${parsed.owner}/${parsed.repo}`);
      setValue('');
      inputRef.current?.blur();
    }
  }

  return (
    <header className="flex h-11 shrink-0 items-center gap-4 border-b border-rule bg-surface-1 px-3">
      <a
        href="/"
        className="flex items-center gap-1.5 font-collar text-sm font-bold tracking-tight"
      >
        <ScanSearch className="h-4 w-4 text-structure" strokeWidth={2} />
        RepoLens
      </a>

      <form onSubmit={handleSubmit} className="relative max-w-md flex-1">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-structure" />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Open a repository (owner/repo)"
          className="h-7 w-full rounded-control border border-structure/60 bg-surface-2 pl-8 pr-10 font-collar text-sm text-text-primary placeholder:text-text-muted focus:border-signal focus:outline-none"
        />
        <Kbd className="absolute right-2 top-1/2 -translate-y-1/2">/</Kbd>
      </form>

      <div className="ml-auto flex items-center gap-3 font-collar text-sm text-text-secondary">
        {owner && repo && (
          <a
            href={`https://github.com/${owner}/${repo}`}
            target="_blank"
            rel="noreferrer"
            className="link flex items-center gap-1"
          >
            {owner}/{repo}
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </header>
  );
}
