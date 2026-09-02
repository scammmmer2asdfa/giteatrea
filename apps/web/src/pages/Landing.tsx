import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanSearch, Star } from 'lucide-react';
import { Button } from '@repolens/ui';
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
      {/* A drafting title block: designation, description, then the field you fill in. */}
      <div className="neatline w-full max-w-xl bg-surface-1 p-8">
        <div className="flex items-baseline gap-2">
          <ScanSearch className="h-5 w-5 shrink-0 self-center text-structure" strokeWidth={2} />
          <h1 className="font-collar text-2xl font-bold leading-none tracking-tight">RepoLens</h1>
        </div>

        <p className="mt-3 text-base text-text-secondary">
          Give it a repository and it draws you the map — which directories hold the weight, what
          changed in the last two weeks, and who has been doing the work.
        </p>

        <div className="my-6 border-b border-rule" />

        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <label htmlFor="repo-input" className="collar-label">
            Repository
          </label>
          <div className="flex gap-2">
            <input
              id="repo-input"
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="github.com/owner/repository"
              className="h-9 min-w-0 flex-1 rounded-control border border-structure/60 bg-surface-2 px-3 font-mono text-sm text-text-primary placeholder:text-text-muted focus:border-signal focus:outline-none"
            />
            <Button type="submit" variant="primary" size="md">
              Open
            </Button>
          </div>
          <p className="text-sm text-text-muted">
            A URL, <span className="font-mono">owner/repo</span>, or just a username.
          </p>
          {error && <p className="text-sm text-text-secondary">{error}</p>}
        </form>

        {ownerOnly && (
          <div className="mt-6 border-t border-rule pt-4">
            <p className="collar-label">Repositories owned by {ownerOnly}</p>
            {ownerRepos.isLoading && (
              <p className="py-3 text-base text-text-secondary">Looking them up</p>
            )}
            {ownerRepos.isError && (
              <p className="py-3 text-base text-text-secondary">
                GitHub has no owner named &quot;{ownerOnly}&quot;.
              </p>
            )}
            <ul className="mt-1 max-h-72 divide-y divide-rule/40 overflow-auto">
              {ownerRepos.data?.map((repo) => (
                <li key={repo.id}>
                  <button
                    onClick={() => navigate(`/${repo.owner.login}/${repo.name}`)}
                    className="leader w-full py-1 text-left text-base hover:text-text-primary"
                  >
                    <span className="truncate text-text-primary">{repo.name}</span>
                    <span className="leader-fill" aria-hidden="true" />
                    <span className="flex shrink-0 items-center gap-1 font-collar text-sm tabular text-text-muted">
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
