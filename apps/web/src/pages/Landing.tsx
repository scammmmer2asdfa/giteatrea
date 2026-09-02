import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Logo } from '@repolens/ui';
import { parseGitHubInput } from '@repolens/utils';

export function Landing() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const parsed = parseGitHubInput(input);
    if (!parsed) {
      setError('Enter a valid GitHub URL, "owner/repo", or username.');
      return;
    }
    navigate(parsed.type === 'repo' ? `/${parsed.owner}/${parsed.repo}` : `/${parsed.owner}`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-10 text-text-primary">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-2.5">
          <Logo className="h-8 w-8 text-text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">RepoLens</h1>
        </div>

        <p className="mt-3 text-[13px] leading-relaxed text-text-secondary">
          Point it at a repository and it draws the map — which directories hold the weight, what
          changed in the last two weeks, and who has been doing the work.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-2">
          <label htmlFor="repo-input" className="legend">
            Repository
          </label>
          <div className="flex gap-2">
            <input
              id="repo-input"
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="github.com/owner/repository"
              className="h-9 min-w-0 flex-1 rounded-control border border-rule bg-surface-2 px-3 font-mono text-xs text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
            />
            <Button type="submit" variant="primary" size="md">
              Open
            </Button>
          </div>
          <p className="text-xs text-text-muted">
            A URL, <span className="font-mono text-text-secondary">owner/repo</span>, or just a
            username.
          </p>
          {error && <p className="text-xs text-accent">{error}</p>}
        </form>
      </div>
    </div>
  );
}
