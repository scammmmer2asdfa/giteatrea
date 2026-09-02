# @repolens/desktop (planned)

RepoLens's desktop shell will wrap `apps/web` in [Tauri](https://tauri.app), so the
web app's UI, data-fetching, and visualization code (and every package under
`packages/`) can be reused as-is. No code in `apps/web` is aware of whether
it's running in a browser tab or a Tauri window.

## Why this isn't scaffolded yet

Tauri requires a Rust toolchain (`rustc`, `cargo`) and platform-specific
system dependencies (WebKitGTK on Linux, WebView2 on Windows). Rather than
commit a `src-tauri/` scaffold that can't be built or verified in every
contributor's environment, this app is intentionally left as a stub until
someone picks up the desktop milestone.

## Getting started (once you have Rust + the Tauri CLI installed)

```bash
cd apps/desktop
pnpm dlx create-tauri-app@latest --manager pnpm
```

Point Tauri's `devPath`/`distDir` at `apps/web`'s dev server and build
output, add the required window/permission configuration in
`src-tauri/tauri.conf.json`, and re-add `dev`/`build` scripts to
[package.json](package.json) that call `tauri dev` / `tauri build`.

## Sharing local data

If/when the desktop app needs local persistence (cached repository data,
offline browsing), prefer `better-sqlite3` or Tauri's SQL plugin behind a
small `packages/utils` abstraction so `apps/web` can use an IndexedDB-backed
implementation of the same interface in the browser.
