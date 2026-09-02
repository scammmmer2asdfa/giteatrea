export interface ParsedOwnerInput {
  type: 'owner';
  owner: string;
}

export interface ParsedRepoInput {
  type: 'repo';
  owner: string;
  repo: string;
}

export type ParsedGitHubInput = ParsedOwnerInput | ParsedRepoInput;

const OWNER_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;
const REPO_RE = /^[a-zA-Z0-9._-]+$/;

function stripGitSuffix(value: string): string {
  return value.endsWith('.git') ? value.slice(0, -4) : value;
}

/**
 * Parses user-supplied text into a GitHub owner or owner/repo reference.
 * Accepts full URLs (https://github.com/owner/repo), SSH remotes
 * (git@github.com:owner/repo.git), "owner/repo" shorthand, and bare owners.
 */
export function parseGitHubInput(rawInput: string): ParsedGitHubInput | null {
  const input = rawInput.trim();
  if (!input) return null;

  // git@github.com:owner/repo.git
  const sshMatch = input.match(/^git@github\.com:([^/]+)\/(.+)$/i);
  if (sshMatch) {
    const owner = sshMatch[1] ?? '';
    const repo = stripGitSuffix((sshMatch[2] ?? '').replace(/\/+$/, ''));
    return isValidOwner(owner) && isValidRepo(repo) ? { type: 'repo', owner, repo } : null;
  }

  // Anything that looks like a URL or has a github.com host, with or without protocol.
  const urlLike = /^([a-z]+:\/\/)?(www\.)?github\.com\//i.test(input);
  if (urlLike) {
    const withProtocol = /^[a-z]+:\/\//i.test(input) ? input : `https://${input}`;
    let url: URL;
    try {
      url = new URL(withProtocol);
    } catch {
      return null;
    }
    const segments = url.pathname.split('/').filter(Boolean);
    const owner = segments[0];
    if (!owner || !isValidOwner(owner)) return null;
    const second = segments[1];
    if (!second) {
      return { type: 'owner', owner };
    }
    const repo = stripGitSuffix(second);
    return isValidRepo(repo) ? { type: 'repo', owner, repo } : null;
  }

  // owner/repo shorthand
  const shorthandMatch = input.match(/^([^/\s]+)\/([^/\s]+)$/);
  if (shorthandMatch) {
    const owner = shorthandMatch[1] ?? '';
    const repo = stripGitSuffix(shorthandMatch[2] ?? '');
    return isValidOwner(owner) && isValidRepo(repo) ? { type: 'repo', owner, repo } : null;
  }

  // bare owner / org name
  if (isValidOwner(input)) {
    return { type: 'owner', owner: input };
  }

  return null;
}

export function isValidOwner(value: string): boolean {
  return OWNER_RE.test(value);
}

export function isValidRepo(value: string): boolean {
  return REPO_RE.test(value) && value !== '.' && value !== '..';
}

export function repoSlug(owner: string, repo: string): string {
  return `${owner}/${repo}`;
}
