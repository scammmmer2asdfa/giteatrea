import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Search, ExternalLink } from 'lucide-react';
import { Kbd, Logo } from '@repolens/ui';
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
    if (!parsed) return;
    navigate(parsed.type === 'repo' ? `/${parsed.owner}/${parsed.repo}` : `/${parsed.owner}`);
    setValue('');
    inputRef.current?.blur();
  }

  return (
    <header className="flex h-12 shrink-0 items-center gap-5 border-b border-rule bg-surface-1 pl-3 pr-4">
      <a href="/" className="flex shrink-0 items-center gap-2">
        <Logo className="h-[19px] w-[19px] text-text-primary" />
        <span className="text-[13px] font-semibold tracking-tight">RepoLens</span>
      </a>

      {/* The repository under inspection is the single most important fact on screen. */}
      {owner && repo && (
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-4 w-px bg-rule-strong" />
          <div className="flex min-w-0 items-baseline gap-1.5 font-mono text-sm">
            <Link to={`/${owner}`} className="truncate text-text-muted hover:text-accent-ink">
              {owner}
            </Link>
            <span className="text-text-muted">/</span>
            <a
              href={`https://github.com/${owner}/${repo}`}
              target="_blank"
              rel="noreferrer"
              className="group flex min-w-0 items-baseline gap-1.5"
            >
              <span className="truncate font-medium text-text-primary group-hover:text-accent">
                {repo}
              </span>
              <ExternalLink className="h-3 w-3 shrink-0 self-center text-text-muted" />
            </a>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative ml-auto w-72">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Open a repository"
          className="h-7 w-full rounded-control border border-rule bg-surface-2 pl-8 pr-9 font-mono text-xs text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
        />
        <Kbd className="absolute right-2 top-1/2 -translate-y-1/2">/</Kbd>
      </form>
    </header>
  );
}
