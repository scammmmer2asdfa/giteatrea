import { useMemo } from 'react';
import { GitHubClient } from '@repolens/github';
import { useAuthStore } from '../store/auth-store.js';

const envToken = (import.meta.env.VITE_GITHUB_TOKEN as string | undefined) || null;

/** Returns a GitHubClient authenticated with the user's token, falling back to the env token. */
export function useGitHubClient(): GitHubClient {
  const token = useAuthStore((s) => s.token);
  return useMemo(() => new GitHubClient({ token: token ?? envToken }), [token]);
}
