import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Button, Logo } from '@repolens/ui';
import { formatCompactNumber, parseGitHubInput } from '@repolens/utils';
import { useOwnerRepositories } from '../hooks/useRepoQueries.js';

export function Landing() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [ownerOnly, setOwnerOnly] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ownerRepos = useOwnerRepositories(ownerOnly ?? '');

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const parsed = parseGitHubInput(input);
    if (!parsed) {
      setError('Enter a valid GitHub URL, "owner/repo", or username.');
      setOwnerOnly(null);
      return;
    }
    if (parsed.type === 'repo') {
      navigate(`/${parsed.owner}/${parsed.repo}`);
    } else {
      setOwnerOnly(parsed.owner);
    }
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

        {ownerOnly && (
          <div className="mt-6 border-t border-rule pt-4">
            <p className="legend">Repositories owned by {ownerOnly}</p>
            {ownerRepos.isLoading && (
              <p className="py-3 text-xs text-text-secondary">Looking them up</p>
            )}
            {ownerRepos.isError && (
              <p className="py-3 text-xs text-accent">
                GitHub has no owner named &quot;{ownerOnly}&quot;.
              </p>
            )}
            <ul className="mt-1.5 max-h-72 divide-y divide-rule/60 overflow-auto">
              {ownerRepos.data?.map((repo) => (
                <li key={repo.id}>
                  <button
                    onClick={() => navigate(`/${repo.owner.login}/${repo.name}`)}
                    className="flex w-full items-center gap-3 py-1.5 text-left hover:text-accent"
                  >
                    <span className="min-w-0 flex-1 truncate text-[13px]">{repo.name}</span>
                    <span className="flex shrink-0 items-center gap-1 font-mono text-xs tabular text-text-muted">
                      <Star className="h-3 w-3" strokeWidth={1.75} />
                      {formatCompactNumber(repo.stargazersCount)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
