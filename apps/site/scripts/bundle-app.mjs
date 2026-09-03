// Builds the web app and nests it under the marketing site's dist as /app/, so
// one deployment serves both and the "Open in browser" link has a real target.
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const siteDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = join(siteDir, '..', '..');
const webDist = join(repoRoot, 'apps', 'web', 'dist');
const target = join(siteDir, 'dist', 'app');
// The nested app sits under whatever prefix the site itself is served from,
// so on GitHub Pages that is /giteatrea/app/ rather than /app/.
const siteBase = process.env.SITE_BASE || '/';
const webBase = `${siteBase.replace(/\/$/, '')}/app/`;

execFileSync('pnpm', ['--filter', '@repolens/web', 'build'], {
  cwd: repoRoot,
  stdio: 'inherit',
  env: { ...process.env, WEB_BASE: webBase },
});

if (!existsSync(webDist)) {
  throw new Error(`Expected the web build at ${webDist}`);
}

rmSync(target, { recursive: true, force: true });
cpSync(webDist, target, { recursive: true });
console.log(`bundled the web app into ${target}`);
