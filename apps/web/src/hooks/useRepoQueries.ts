import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { buildFileTree } from '@repolens/utils';
import { useGitHubClient } from './useGitHubClient.js';

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
    queryFn: () => client.getOwnerRepositories(owner),
    enabled: Boolean(owner),
  });
}
