import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { buildFileTree } from '@repolens/utils';
import { StatsPendingError } from '@repolens/types';
import { useGitHubClient } from './useGitHubClient.js';
import { useAuthStore } from '../store/auth-store.js';

export function useRepository(owner: string, repo: string) {
  const client = useGitHubClient();
  return useQuery({
    queryKey: ['repository', owner, repo],
    queryFn: () => client.getRepository(owner, repo),
    enabled: Boolean(owner && repo),
  });
}

export function useLanguages(owner: string, repo: string) {
  const client = useGitHubClient();
  return useQuery({
    queryKey: ['languages', owner, repo],
    queryFn: () => client.getLanguages(owner, repo),
    enabled: Boolean(owner && repo),
  });
}

export function useBranches(owner: string, repo: string, defaultBranch?: string) {
  const client = useGitHubClient();
  return useQuery({
    queryKey: ['branches', owner, repo],
    queryFn: () => client.getBranches(owner, repo, defaultBranch),
    enabled: Boolean(owner && repo),
  });
}

export function useContributors(owner: string, repo: string) {
  const client = useGitHubClient();
  return useQuery({
    queryKey: ['contributors', owner, repo],
    queryFn: () => client.getContributors(owner, repo),
    enabled: Boolean(owner && repo),
  });
}

export function useFileTree(owner: string, repo: string, ref?: string) {
  const client = useGitHubClient();
  return useQuery({
    queryKey: ['tree', owner, repo, ref],
    queryFn: async () => {
      const entries = await client.getTree(owner, repo, ref as string);
      return buildFileTree(entries, repo);
    },
    enabled: Boolean(owner && repo && ref),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCommits(owner: string, repo: string, path?: string) {
  const client = useGitHubClient();
  return useInfiniteQuery({
    queryKey: ['commits', owner, repo, path ?? null],
    queryFn: ({ pageParam }) =>
      client.getCommits(owner, repo, { page: pageParam, path, perPage: 30 }),
    enabled: Boolean(owner && repo),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => (lastPage.length === 30 ? pages.length + 1 : undefined),
  });
}

export function useFileContent(owner: string, repo: string, path: string | null, ref?: string) {
  const client = useGitHubClient();
  return useQuery({
    queryKey: ['file', owner, repo, path, ref],
    queryFn: () => client.getFileContent(owner, repo, path as string, ref),
    enabled: Boolean(owner && repo && path),
    staleTime: 5 * 60 * 1000,
  });
}

export function useOwnerRepositories(owner: string) {
  const client = useGitHubClient();
  return useQuery({
    queryKey: ['owner-repos', owner],
    queryFn: () => client.getOwnerRepositories(owner, { perPage: 12 }),
    enabled: Boolean(owner),
  });
}

/** The signed-in user, or null when there's no token. Used to unlock private repos. */
export function useViewer() {
  const client = useGitHubClient();
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['viewer', token],
    queryFn: () => client.getAuthenticatedUser(),
    enabled: Boolean(token),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useOwnerProfile(owner: string) {
  const client = useGitHubClient();
  return useQuery({
    queryKey: ['owner-profile', owner],
    queryFn: () => client.getOwnerProfile(owner),
    enabled: Boolean(owner),
  });
}

/**
 * Every repository for an owner. When the owner is the signed-in user we read
 * /user/repos instead, because /users/:owner/repos can only return public ones.
 */
export function useAllOwnerRepositories(owner: string) {
  const client = useGitHubClient();
  const viewer = useViewer();
  const isViewer = Boolean(viewer.data && viewer.data.login.toLowerCase() === owner.toLowerCase());

  return useInfiniteQuery({
    queryKey: ['owner-repos-all', owner, isViewer],
    queryFn: ({ pageParam }) =>
      isViewer
        ? client.getAuthenticatedUserRepositories({ page: pageParam, perPage: 50 })
        : client.getOwnerRepositories(owner, { page: pageParam, perPage: 50 }),
    // Wait for the viewer check so we don't fetch public-only then refetch.
    enabled: Boolean(owner) && !viewer.isLoading,
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => (lastPage.length === 50 ? pages.length + 1 : undefined),
  });
}

export function usePullRequests(owner: string, repo: string, state: 'open' | 'closed' | 'all') {
  const client = useGitHubClient();
  return useInfiniteQuery({
    queryKey: ['pulls', owner, repo, state],
    queryFn: ({ pageParam }) =>
      client.getPullRequests(owner, repo, state, { page: pageParam, perPage: 30 }),
    enabled: Boolean(owner && repo),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => (lastPage.length === 30 ? pages.length + 1 : undefined),
  });
}

export function useIssues(owner: string, repo: string, state: 'open' | 'closed' | 'all') {
  const client = useGitHubClient();
  return useInfiniteQuery({
    queryKey: ['issues', owner, repo, state],
    queryFn: ({ pageParam }) =>
      client.getIssues(owner, repo, state, { page: pageParam, perPage: 30 }),
    enabled: Boolean(owner && repo),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => (lastPage.length === 30 ? pages.length + 1 : undefined),
  });
}

export function useReleases(owner: string, repo: string) {
  const client = useGitHubClient();
  return useInfiniteQuery({
    queryKey: ['releases', owner, repo],
    queryFn: ({ pageParam }) => client.getReleases(owner, repo, { page: pageParam, perPage: 20 }),
    enabled: Boolean(owner && repo),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => (lastPage.length === 20 ? pages.length + 1 : undefined),
  });
}

export function useDependencies(owner: string, repo: string) {
  const client = useGitHubClient();
  return useQuery({
    queryKey: ['dependencies', owner, repo],
    queryFn: () => client.getDependencies(owner, repo),
    enabled: Boolean(owner && repo),
    staleTime: 10 * 60 * 1000,
  });
}

export function useCommitActivity(owner: string, repo: string) {
  const client = useGitHubClient();
  return useQuery({
    queryKey: ['commit-activity', owner, repo],
    queryFn: () => client.getCommitActivity(owner, repo),
    enabled: Boolean(owner && repo),
    // A 202 means the stats cache is still building, so keep retrying briefly.
    retry: (count, error) => error instanceof StatsPendingError && count < 5,
    retryDelay: (count) => Math.min(1000 * 2 ** count, 8000),
    staleTime: 10 * 60 * 1000,
  });
}
