# RepoLens

RepoLens is a visual GitHub repository explorer. Instead of reading a file
tree top to bottom, RepoLens turns a repository into an interactive map:
an overview of its shape, a size-weighted treemap of every file, a browsable
file tree with previews, and a commit history — all backed by the real
GitHub API.

This is not a demo. There's no hardcoded repository — point RepoLens at any
public GitHub repo (or a private one, with a token) and it renders live data.

## Status

RepoLens is early and under active development. The first milestone is done:

```
GitHub URL → Repository → Overview → Repository Map → Files → Commits
```

Branches and Contributors are also implemented. Dependencies, Activity,
Pull Requests, Issues, Releases, and the "time machine" (history scrubbing)
are on the roadmap — see [CONTRIBUTING.md](CONTRIBUTING.md).

## Features

- **Overview** — stars, forks, watchers, license, topics, language breakdown.
- **Repository Map** — every file in the repo laid out as a squarified
  treemap, sized by bytes and colored by language. Click a folder to zoom in,
  click a file to open it.
- **Files** — a familiar tree browser with a read-only file preview pane.
- **Commits** — paginated commit history with author and relative time.
- **Branches** / **Contributors** — quick reference views.
- Works with **public and private repositories** via a personal access
  token, entered locally in Settings (never sent anywhere but the GitHub API).

## Tech stack

| Layer         | Choice                                                 |
| ------------- | ------------------------------------------------------ |
| Frontend      | React + TypeScript + Vite                              |
| Visualization | D3 (`d3-hierarchy` treemaps), custom SVG rendering     |
| Styling       | Tailwind CSS                                           |
| State         | Zustand (client state) + TanStack Query (server state) |
| API           | GitHub REST API                                        |
| Monorepo      | pnpm workspaces                                        |

## Project structure

```
repolens/
├── apps/
│   ├── web/       # React + Vite application (the primary experience)
│   ├── desktop/   # Tauri shell (planned, wraps apps/web)
│   └── api/       # Minimal Node server, future home of the OAuth web flow
├── packages/
│   ├── ui/        # Shared, framework-level React components
│   ├── github/    # Typed GitHub REST API client
│   ├── graph/     # Treemap layout + language color utilities (D3-based)
│   ├── types/     # Shared TypeScript types
│   └── utils/     # URL parsing, formatting, file-tree utilities
└── docs/
```

`apps/web` is the only runnable app today. `packages/*` hold every bit of
logic that isn't UI markup, so a future desktop app (or a second frontend)
can reuse the GitHub client, graph layout, and types without duplication.

## Getting started

Requirements: Node.js 20+, [pnpm](https://pnpm.io) 10+.

```bash
pnpm install
cp .env.example .env   # optional: add a GitHub token to raise API rate limits
pnpm dev                # starts apps/web on http://localhost:5173
```

Unauthenticated GitHub API requests are capped at 60/hour. Either set
`VITE_GITHUB_TOKEN` in `.env` or add a token in the app's Settings page — both
use a personal access token with no scopes needed for public data (add
`repo` scope for private repositories).

### Scripts

Run from the repo root:

| Command                        | Description                                      |
| ------------------------------ | ------------------------------------------------ |
| `pnpm dev`                     | Run the web app in dev mode                      |
| `pnpm build`                   | Type-check and build every package + the web app |
| `pnpm lint`                    | ESLint across the whole monorepo                 |
| `pnpm format` / `format:check` | Prettier write / check                           |
| `pnpm typecheck`               | `tsc --noEmit` in every package                  |
| `pnpm test`                    | Vitest unit tests in every package               |

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) for the
roadmap, coding conventions, and how to submit changes. Please also read the
[Code of Conduct](CODE_OF_CONDUCT.md).

## Security

See [SECURITY.md](SECURITY.md) for how to report a vulnerability.

## License

[MIT](LICENSE)
