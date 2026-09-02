# Contributing to RepoLens

Thanks for your interest in RepoLens. This project is early-stage and
intentionally scoped — please read this before opening a large PR.

## Development setup

Requirements: Node.js 20+, [pnpm](https://pnpm.io) 10+.

```bash
pnpm install
pnpm dev
```

Before pushing, run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

CI runs the same four checks on every pull request.

## Project structure

See the [README](README.md#project-structure). In short: UI lives in
`apps/web`, everything else (GitHub API client, types, graph layout, format
helpers) lives in `packages/*` so it can be reused by other apps later
(desktop, API).

## Coding conventions

- TypeScript everywhere, `strict` mode. Avoid `any`.
- Prefer small, composable functions over large ones. Don't add
  abstractions for a single call site.
- UI: Tailwind utility classes, no CSS-in-JS. Keep components dense and
  information-rich rather than spacious — see the "product philosophy" in
  the README.
- Data fetching goes through `packages/github`'s `GitHubClient` and is
  called from `apps/web/src/hooks/useRepoQueries.ts` via TanStack Query.
  Don't call `fetch` directly against the GitHub API from components.
- Add a unit test for new pure logic (`packages/utils`, `packages/graph`,
  `packages/github`). UI tests are welcome but not required for every
  component.

## Roadmap / good first issues

These sidebar sections currently render a "coming soon" placeholder and are
open for contribution:

- **Dependencies** — parse `package.json`/lockfiles (or other manifests) from
  the repository tree into a dependency graph.
- **Activity** — a timeline combining commits, releases, and issue/PR events.
- **Pull Requests** / **Issues** — list + detail views using
  `GitHubClient.getPullRequests` / `getIssues` (already implemented in
  `packages/github`, not yet wired into a page).
- **Releases** — list view using `GitHubClient.getReleases` (already
  implemented, not yet wired into a page).
- **Time machine** — a slider to scrub the repository map across commits.
- **GitHub OAuth web flow** — `apps/api` is a stub; it needs the
  authorization-code exchange so users don't have to paste a personal access
  token.
- **Desktop app** — see `apps/desktop/README.md`.

When picking up one of these, open an issue first to avoid duplicate work.

## Commit messages & PRs

- Keep PRs focused on one feature or fix.
- Describe _why_ a change is needed, not just what changed.
- Make sure `pnpm build` succeeds before requesting review.

## Reporting bugs

Open a GitHub issue with steps to reproduce, the repository URL you tested
against (if relevant), and your browser/OS.
