# Security Policy

## Supported versions

RepoLens is pre-1.0 and does not yet publish versioned releases. Security
fixes are applied to the `main` branch only.

## Reporting a vulnerability

Please **do not open a public GitHub issue** for security vulnerabilities.

Instead, report it privately using one of the following:

- GitHub's [private vulnerability reporting](../../security/advisories/new)
  for this repository (preferred), or
- Contact a maintainer directly.

Please include:

- A description of the vulnerability and its potential impact
- Steps to reproduce (a minimal example is ideal)
- Any relevant logs, screenshots, or proof-of-concept code

We'll acknowledge your report as soon as possible and keep you updated as we
investigate and fix the issue.

## Scope notes

- RepoLens's GitHub personal access token is stored only in the browser's
  `localStorage` and is sent only to `api.github.com`. It is never sent to
  any RepoLens-operated server.
- `apps/api` is currently a placeholder with no authentication logic; treat
  any security review of the OAuth flow as applying once that work lands
  (see [CONTRIBUTING.md](CONTRIBUTING.md)).
