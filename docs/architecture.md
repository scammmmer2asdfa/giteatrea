# Architecture

## Data flow

```
apps/web (React components)
  → hooks/useRepoQueries.ts (TanStack Query hooks)
    → hooks/useGitHubClient.ts (builds an authenticated client)
      → packages/github (GitHubClient — typed fetch wrapper)
        → GitHub REST API
```

Query results are cached by TanStack Query, keyed by `[resource, owner, repo, ...]`.
Auth token lives in `apps/web/src/store/auth-store.ts` (Zustand, persisted to
`localStorage`) and is read by `useGitHubClient` to construct a `GitHubClient`.

## Why a monorepo

`packages/types`, `packages/github`, `packages/graph`, and `packages/utils`
contain no React or DOM code. They're the parts of RepoLens most likely to be
reused by a second frontend (the planned Tauri desktop app) or a future CLI,
so they're kept independent of `apps/web` from the start rather than
extracted later.

`packages/ui` is the one exception — it's React components, but framework
(routing, state) agnostic, so it can be shared between a web and desktop
shell without pulling in `apps/web`'s routing/store setup.

## Repository Map rendering

The treemap is computed in `packages/graph` (`computeTreemapLayout`, built on
`d3-hierarchy`'s squarified tiling) and rendered as plain SVG in
`apps/web/src/components/RepoTreemap.tsx` — no `d3-selection`/DOM-manipulation
code, so it composes normally with React's render cycle and works inside
Tauri's webview without changes.
