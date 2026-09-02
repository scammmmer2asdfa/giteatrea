import { describe, expect, it, vi } from 'vitest';
import { GitHubClient } from '../src/client.js';
import { GitHubApiError } from '@repolens/types';

function jsonResponse(
  body: unknown,
  init: { status?: number; headers?: Record<string, string> } = {},
) {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { 'content-type': 'application/json', ...init.headers },
  });
}

describe('GitHubClient', () => {
  it('maps a repository payload to the internal Repository shape', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      jsonResponse({
        id: 1,
        owner: { login: 'facebook', avatar_url: 'a', html_url: 'b', type: 'Organization' },
        name: 'react',
        full_name: 'facebook/react',
        description: 'A UI library',
        html_url: 'https://github.com/facebook/react',
        homepage: null,
        default_branch: 'main',
        private: false,
        fork: false,
        archived: false,
        stargazers_count: 100,
        watchers_count: 100,
        forks_count: 10,
        open_issues_count: 5,
        size: 1000,
        license: { key: 'mit', name: 'MIT License', spdx_id: 'MIT' },
        topics: ['javascript'],
        language: 'JavaScript',
        created_at: '2020-01-01T00:00:00Z',
        updated_at: '2020-01-02T00:00:00Z',
        pushed_at: '2020-01-03T00:00:00Z',
      }),
    );

    const client = new GitHubClient({ fetchImpl: fetchImpl as unknown as typeof fetch });
    const repo = await client.getRepository('facebook', 'react');

    expect(repo.fullName).toBe('facebook/react');
    expect(repo.license?.spdxId).toBe('MIT');
    expect(repo.owner.type).toBe('Organization');
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://api.github.com/repos/facebook/react',
      expect.any(Object),
    );
  });

  it('throws a GitHubApiError with status on failure', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse({ message: 'Not Found' }, { status: 404 }));
    const client = new GitHubClient({ fetchImpl: fetchImpl as unknown as typeof fetch });

    await expect(client.getRepository('nobody', 'nothing')).rejects.toMatchObject(
      new GitHubApiError('Not Found', 404),
    );
  });
});
