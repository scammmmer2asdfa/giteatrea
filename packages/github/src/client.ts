import type {
  Branch,
  Commit,
  Contributor,
  FileTreeEntry,
  GitHubUser,
  IssueSummary,
  LanguageBreakdown,
  OwnerProfile,
  PullRequestSummary,
  RateLimitInfo,
  Release,
  Repository,
} from '@repolens/types';
import { GitHubApiError } from '@repolens/types';

const DEFAULT_BASE_URL = 'https://api.github.com';

export interface GitHubClientOptions {
  token?: string | null;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

export interface ListCommitsParams {
  sha?: string;
  path?: string;
  page?: number;
  perPage?: number;
}

export interface ListParams {
  page?: number;
  perPage?: number;
}

/**
 * Thin, typed wrapper around the GitHub REST API. Every method maps GitHub's
 * snake_case payloads onto RepoLens's internal camelCase types so the rest of
 * the app never has to think about the raw API shape.
 */
export class GitHubClient {
  private readonly baseUrl: string;
  private readonly token: string | null;
  private readonly fetchImpl: typeof fetch;
  public lastRateLimit: RateLimitInfo | null = null;

  constructor(options: GitHubClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    this.token = options.token ?? null;
    // Must stay bound to the global: calling an unbound `fetch` as a method
    // throws "Can only call Window.fetch on instances of Window".
    this.fetchImpl = options.fetchImpl ?? globalThis.fetch.bind(globalThis);
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const headers = new Headers(init?.headers);
    headers.set('Accept', 'application/vnd.github+json');
    headers.set('X-GitHub-Api-Version', '2022-11-28');
    if (this.token) headers.set('Authorization', `Bearer ${this.token}`);

    const response = await this.fetchImpl(`${this.baseUrl}${path}`, { ...init, headers });

    const limit = response.headers.get('x-ratelimit-limit');
    const remaining = response.headers.get('x-ratelimit-remaining');
    const reset = response.headers.get('x-ratelimit-reset');
    if (limit && remaining && reset) {
      this.lastRateLimit = {
        limit: Number(limit),
        remaining: Number(remaining),
        reset: Number(reset),
      };
    }

    if (!response.ok) {
      let message = response.statusText;
      try {
        const body = (await response.json()) as { message?: string };
        if (body.message) message = body.message;
      } catch {
        // ignore body parse failures
      }
      throw new GitHubApiError(message, response.status, this.lastRateLimit ?? undefined);
    }

    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  }

  private query(params: Record<string, string | number | undefined>): string {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) search.set(key, String(value));
    }
    const qs = search.toString();
    return qs ? `?${qs}` : '';
  }

  async getAuthenticatedUser(): Promise<GitHubUser> {
    const data = await this.request<RawUser>('/user');
    return mapUser(data);
  }

  async getRepository(owner: string, repo: string): Promise<Repository> {
    const data = await this.request<RawRepository>(`/repos/${owner}/${repo}`);
    return mapRepository(data);
  }

  async getLanguages(owner: string, repo: string): Promise<LanguageBreakdown> {
    return this.request<LanguageBreakdown>(`/repos/${owner}/${repo}/languages`);
  }

  /** Lists a user or organization's repositories, most recently pushed first. */
  /** Public repositories for any user or organization, most recently pushed first. */
  async getOwnerRepositories(owner: string, params: ListParams = {}): Promise<Repository[]> {
    const data = await this.request<RawRepository[]>(
      `/users/${owner}/repos${this.query({
        sort: 'pushed',
        page: params.page,
        per_page: params.perPage ?? 30,
      })}`,
    );
    return data.map(mapRepository);
  }

  /**
   * Repositories for the signed-in user, including private ones. Requires a
   * token; `/users/:owner/repos` can only ever return public results.
   */
  async getAuthenticatedUserRepositories(params: ListParams = {}): Promise<Repository[]> {
    const data = await this.request<RawRepository[]>(
      `/user/repos${this.query({
        sort: 'pushed',
        visibility: 'all',
        affiliation: 'owner,collaborator,organization_member',
        page: params.page,
        per_page: params.perPage ?? 30,
      })}`,
    );
    return data.map(mapRepository);
  }

  /** Profile for a user or organization, used as the owner page header. */
  async getOwnerProfile(owner: string): Promise<OwnerProfile> {
    const data = await this.request<RawOwnerProfile>(`/users/${owner}`);
    return {
      login: data.login,
      name: data.name,
      avatarUrl: data.avatar_url,
      htmlUrl: data.html_url,
      type: data.type,
      bio: data.bio ?? null,
      company: data.company ?? null,
      location: data.location ?? null,
      blog: data.blog || null,
      publicRepos: data.public_repos,
      followers: data.followers ?? 0,
      following: data.following ?? 0,
      createdAt: data.created_at,
    };
  }

  async getBranches(owner: string, repo: string, defaultBranch?: string): Promise<Branch[]> {
    const data = await this.request<RawBranch[]>(
      `/repos/${owner}/${repo}/branches${this.query({ per_page: 100 })}`,
    );
    return data.map((b) => ({
      name: b.name,
      commitSha: b.commit.sha,
      isProtected: b.protected,
      isDefault: b.name === defaultBranch,
    }));
  }

  /** Recursively fetches the full file tree for a given ref (branch/sha). */
  async getTree(owner: string, repo: string, ref: string): Promise<FileTreeEntry[]> {
    const data = await this.request<RawTreeResponse>(
      `/repos/${owner}/${repo}/git/trees/${ref}${this.query({ recursive: 1 })}`,
    );
    return data.tree.map((entry) => ({
      path: entry.path,
      type: entry.type,
      sha: entry.sha,
      size: entry.size,
      mode: entry.mode,
      url: entry.url,
    }));
  }

  async getCommits(owner: string, repo: string, params: ListCommitsParams = {}): Promise<Commit[]> {
    const data = await this.request<RawCommit[]>(
      `/repos/${owner}/${repo}/commits${this.query({
        sha: params.sha,
        path: params.path,
        page: params.page,
        per_page: params.perPage ?? 30,
      })}`,
    );
    return data.map(mapCommit);
  }

  async getContributors(
    owner: string,
    repo: string,
    params: ListParams = {},
  ): Promise<Contributor[]> {
    const data = await this.request<RawContributor[]>(
      `/repos/${owner}/${repo}/contributors${this.query({
        page: params.page,
        per_page: params.perPage ?? 100,
        anon: 'false',
      })}`,
    );
    return data.map((c) => ({
      login: c.login,
      avatarUrl: c.avatar_url,
      htmlUrl: c.html_url,
      contributions: c.contributions,
    }));
  }

  async getReleases(owner: string, repo: string, params: ListParams = {}): Promise<Release[]> {
    const data = await this.request<RawRelease[]>(
      `/repos/${owner}/${repo}/releases${this.query({ page: params.page, per_page: params.perPage ?? 30 })}`,
    );
    return data.map((r) => ({
      id: r.id,
      tagName: r.tag_name,
      name: r.name,
      htmlUrl: r.html_url,
      isDraft: r.draft,
      isPrerelease: r.prerelease,
      publishedAt: r.published_at,
      body: r.body,
    }));
  }

  async getPullRequests(
    owner: string,
    repo: string,
    state: 'open' | 'closed' | 'all' = 'open',
    params: ListParams = {},
  ): Promise<PullRequestSummary[]> {
    const data = await this.request<RawPullRequest[]>(
      `/repos/${owner}/${repo}/pulls${this.query({
        state,
        page: params.page,
        per_page: params.perPage ?? 30,
      })}`,
    );
    return data.map((pr) => ({
      number: pr.number,
      title: pr.title,
      state: pr.state,
      isDraft: pr.draft,
      isMerged: pr.merged_at !== null,
      htmlUrl: pr.html_url,
      author: pr.user ? { login: pr.user.login, avatarUrl: pr.user.avatar_url } : null,
      createdAt: pr.created_at,
      updatedAt: pr.updated_at,
      comments: pr.comments ?? 0,
      labels: pr.labels?.map((l) => l.name) ?? [],
    }));
  }

  async getIssues(
    owner: string,
    repo: string,
    state: 'open' | 'closed' | 'all' = 'open',
    params: ListParams = {},
  ): Promise<IssueSummary[]> {
    const data = await this.request<RawIssue[]>(
      `/repos/${owner}/${repo}/issues${this.query({
        state,
        page: params.page,
        per_page: params.perPage ?? 30,
      })}`,
    );
    // GitHub's issues endpoint also returns PRs; filter those out.
    return data
      .filter((issue) => !issue.pull_request)
      .map((issue) => ({
        number: issue.number,
        title: issue.title,
        state: issue.state,
        htmlUrl: issue.html_url,
        author: issue.user ? { login: issue.user.login, avatarUrl: issue.user.avatar_url } : null,
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
        comments: issue.comments,
        labels: issue.labels.map((l) => (typeof l === 'string' ? l : l.name)),
      }));
  }

  async getFileContent(owner: string, repo: string, path: string, ref?: string): Promise<string> {
    const data = await this.request<RawFileContent>(
      `/repos/${owner}/${repo}/contents/${path}${this.query({ ref })}`,
    );
    if (Array.isArray(data) || data.type !== 'file' || !data.content) {
      throw new Error(`"${path}" is not a readable file`);
    }
    return decodeBase64(data.content);
  }
}

function decodeBase64(content: string): string {
  const binary = atob(content.replace(/\n/g, ''));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder('utf-8').decode(bytes);
}

// --- Raw GitHub API shapes (subset) & mappers -----------------------------

interface RawUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
}

interface RawOwnerProfile extends RawUser {
  type: 'User' | 'Organization';
  bio?: string | null;
  company?: string | null;
  location?: string | null;
  blog?: string | null;
  public_repos: number;
  followers?: number;
  following?: number;
  created_at: string;
}

function mapUser(u: RawUser): GitHubUser {
  return { login: u.login, name: u.name, avatarUrl: u.avatar_url, htmlUrl: u.html_url };
}

interface RawOwner {
  login: string;
  avatar_url: string;
  html_url: string;
  type: 'User' | 'Organization';
}

interface RawRepository {
  id: number;
  owner: RawOwner;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  default_branch: string;
  private: boolean;
  fork: boolean;
  archived: boolean;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  subscribers_count?: number;
  size: number;
  license: { key: string; name: string; spdx_id: string | null } | null;
  topics?: string[];
  language: string | null;
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

function mapRepository(r: RawRepository): Repository {
  return {
    id: r.id,
    owner: {
      login: r.owner.login,
      avatarUrl: r.owner.avatar_url,
      htmlUrl: r.owner.html_url,
      type: r.owner.type,
    },
    name: r.name,
    fullName: r.full_name,
    description: r.description,
    htmlUrl: r.html_url,
    homepage: r.homepage,
    defaultBranch: r.default_branch,
    isPrivate: r.private,
    isFork: r.fork,
    isArchived: r.archived,
    stargazersCount: r.stargazers_count,
    watchersCount: r.watchers_count,
    forksCount: r.forks_count,
    openIssuesCount: r.open_issues_count,
    subscribersCount: r.subscribers_count,
    size: r.size,
    license: r.license
      ? { key: r.license.key, name: r.license.name, spdxId: r.license.spdx_id }
      : null,
    topics: r.topics ?? [],
    language: r.language,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    pushedAt: r.pushed_at,
  };
}

interface RawBranch {
  name: string;
  commit: { sha: string };
  protected: boolean;
}

interface RawTreeEntry {
  path: string;
  type: 'blob' | 'tree' | 'commit';
  sha: string;
  size?: number;
  mode: string;
  url: string;
}

interface RawTreeResponse {
  tree: RawTreeEntry[];
  truncated: boolean;
}

interface RawCommitAuthor {
  name: string;
  email: string;
  date: string;
}

interface RawCommit {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: RawCommitAuthor;
    committer: RawCommitAuthor;
  };
  author: { login: string; avatar_url: string } | null;
  committer: { login: string; avatar_url: string } | null;
  parents: { sha: string }[];
  stats?: { additions: number; deletions: number; total: number };
}

function mapCommit(c: RawCommit): Commit {
  return {
    sha: c.sha,
    message: c.commit.message,
    author: {
      name: c.commit.author.name,
      email: c.commit.author.email,
      date: c.commit.author.date,
      login: c.author?.login,
      avatarUrl: c.author?.avatar_url,
    },
    committer: {
      name: c.commit.committer.name,
      email: c.commit.committer.email,
      date: c.commit.committer.date,
      login: c.committer?.login,
      avatarUrl: c.committer?.avatar_url,
    },
    parents: c.parents.map((p) => p.sha),
    htmlUrl: c.html_url,
    stats: c.stats,
  };
}

interface RawContributor {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

interface RawRelease {
  id: number;
  tag_name: string;
  name: string | null;
  html_url: string;
  draft: boolean;
  prerelease: boolean;
  published_at: string | null;
  body: string | null;
}

interface RawPullRequest {
  number: number;
  title: string;
  state: 'open' | 'closed';
  draft: boolean;
  merged_at: string | null;
  html_url: string;
  user: { login: string; avatar_url: string } | null;
  created_at: string;
  updated_at: string;
  comments?: number;
  labels?: { name: string }[];
}

interface RawIssue {
  number: number;
  title: string;
  state: 'open' | 'closed';
  html_url: string;
  user: { login: string; avatar_url: string } | null;
  created_at: string;
  updated_at: string;
  comments: number;
  labels: ({ name: string } | string)[];
  pull_request?: unknown;
}

interface RawFileContent {
  type: string;
  content?: string;
  encoding?: string;
}
