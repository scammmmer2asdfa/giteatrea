/** A parsed reference to a GitHub repository. */
export interface RepoIdentifier {
  owner: string;
  repo: string;
}

export interface RepositoryOwner {
  login: string;
  avatarUrl: string;
  htmlUrl: string;
  type: 'User' | 'Organization';
}

export interface Repository {
  id: number;
  owner: RepositoryOwner;
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  homepage: string | null;
  defaultBranch: string;
  isPrivate: boolean;
  isFork: boolean;
  isArchived: boolean;
  stargazersCount: number;
  watchersCount: number;
  forksCount: number;
  openIssuesCount: number;
  subscribersCount?: number;
  size: number;
  license: { key: string; name: string; spdxId: string | null } | null;
  topics: string[];
  language: string | null;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
}

export interface LanguageBreakdown {
  [language: string]: number;
}

export type GitObjectType = 'blob' | 'tree' | 'commit';

export interface FileTreeEntry {
  path: string;
  type: GitObjectType;
  sha: string;
  size?: number;
  mode: string;
  url: string;
}

/** Hierarchical node used by the repository map / file tree visualizations. */
export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size: number;
  extension?: string;
  children?: FileTreeNode[];
}

export interface CommitAuthor {
  name: string;
  email: string;
  date: string;
  login?: string;
  avatarUrl?: string;
}

export interface Commit {
  sha: string;
  message: string;
  author: CommitAuthor;
  committer: CommitAuthor;
  parents: string[];
  htmlUrl: string;
  stats?: { additions: number; deletions: number; total: number };
}

export interface Branch {
  name: string;
  commitSha: string;
  isProtected: boolean;
  isDefault: boolean;
}

export interface Contributor {
  login: string;
  avatarUrl: string;
  htmlUrl: string;
  contributions: number;
}

export interface Release {
  id: number;
  tagName: string;
  name: string | null;
  htmlUrl: string;
  isDraft: boolean;
  isPrerelease: boolean;
  publishedAt: string | null;
  body: string | null;
}

export interface PullRequestSummary {
  number: number;
  title: string;
  state: 'open' | 'closed';
  isDraft: boolean;
  isMerged: boolean;
  htmlUrl: string;
  author: { login: string; avatarUrl: string } | null;
  createdAt: string;
  updatedAt: string;
  comments: number;
  labels: string[];
}

export interface IssueSummary {
  number: number;
  title: string;
  state: 'open' | 'closed';
  htmlUrl: string;
  author: { login: string; avatarUrl: string } | null;
  createdAt: string;
  updatedAt: string;
  comments: number;
  labels: string[];
}

export interface GitHubUser {
  login: string;
  name: string | null;
  avatarUrl: string;
  htmlUrl: string;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

export class GitHubApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public rateLimit?: RateLimitInfo,
  ) {
    super(message);
    this.name = 'GitHubApiError';
  }
}
