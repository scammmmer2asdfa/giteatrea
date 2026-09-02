import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@repolens/ui';
import { useAuthStore } from '../store/auth-store.js';
import { useGitHubClient } from '../hooks/useGitHubClient.js';

export function Settings() {
  const token = useAuthStore((s) => s.token);
  const setToken = useAuthStore((s) => s.setToken);
  const [draft, setDraft] = useState(token ?? '');
  const client = useGitHubClient();

  const identity = useQuery({
    queryKey: ['authenticated-user', token],
    queryFn: () => client.getAuthenticatedUser(),
    enabled: Boolean(token),
    retry: false,
  });

  function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setToken(draft || null);
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 px-8 py-7">
      <div>
        <h1 className="font-collar text-xl font-bold text-text-primary">Settings</h1>
        <p className="mt-1 text-base text-text-secondary">
          Without a token, GitHub allows you 60 requests an hour — enough for a few pages. Adding
          one raises that to 5,000 and lets you open your private repositories.
        </p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-2">
        <label htmlFor="token" className="collar-label">
          Personal access token
        </label>
        <input
          id="token"
          type="password"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="ghp_"
          className="h-9 w-full rounded-control border border-structure/60 bg-surface-2 px-3 font-mono text-sm text-text-primary placeholder:text-text-muted focus:border-signal focus:outline-none"
          autoComplete="off"
        />
        <p className="text-sm text-text-muted">
          It stays in this browser and is never sent anywhere but GitHub. Create one at{' '}
          <a
            href="https://github.com/settings/tokens"
            target="_blank"
            rel="noreferrer"
            className="link"
          >
            github.com/settings/tokens
          </a>
          .
        </p>
        <div className="flex gap-2">
          <Button type="submit" variant="primary">
            Save token
          </Button>
          {token && (
            <Button type="button" variant="secondary" onClick={() => setToken(null)}>
              Remove
            </Button>
          )}
        </div>
      </form>

      {token && (
        <div className="border-t border-rule pt-3">
          {identity.isLoading && (
            <p className="text-base text-text-secondary">Checking the token</p>
          )}
          {identity.isError && (
            <p className="flex items-center gap-2 text-base text-text-secondary">
              <XCircle className="h-4 w-4 text-text-muted" strokeWidth={1.75} /> GitHub rejected
              this token.
            </p>
          )}
          {identity.data && (
            <div className="flex items-center gap-3">
              <img
                src={identity.data.avatarUrl}
                alt=""
                className="h-8 w-8 border border-rule grayscale"
              />
              <p className="flex items-center gap-1.5 text-base text-text-primary">
                <CheckCircle2 className="h-3.5 w-3.5 text-signal-ink" strokeWidth={1.75} />
                Signed in as {identity.data.login}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
