import { useEffect, useState } from 'react';
import { Apple, Monitor, Terminal } from 'lucide-react';

const REPO = 'scammmmer2asdfa/giteatrea';

interface ReleaseAsset {
  name: string;
  browser_download_url: string;
  size: number;
}

interface Release {
  tag_name: string;
  html_url: string;
  published_at: string | null;
  assets: ReleaseAsset[];
}

type Platform = {
  id: string;
  label: string;
  detail: string;
  icon: typeof Apple;
  /** The slug .github/workflows/release.yml stamps into every asset filename. */
  slug: string;
  /** Extensions in preference order. `.app.tar.gz` is an updater artifact, never offered. */
  extensions: string[];
};

const PLATFORMS: Platform[] = [
  {
    id: 'mac-arm',
    label: 'macOS',
    detail: 'Apple silicon',
    icon: Apple,
    slug: 'macos-arm64',
    extensions: ['.dmg'],
  },
  {
    id: 'mac-intel',
    label: 'macOS',
    detail: 'Intel',
    icon: Apple,
    slug: 'macos-x64',
    extensions: ['.dmg'],
  },
  {
    id: 'windows',
    label: 'Windows',
    detail: 'x86-64',
    icon: Monitor,
    slug: 'windows-x64',
    extensions: ['.exe', '.msi'],
  },
  {
    id: 'linux',
    label: 'Linux',
    detail: 'AppImage, deb, rpm',
    icon: Terminal,
    slug: 'linux-x64',
    extensions: ['.AppImage', '.deb', '.rpm'],
  },
];

/** Picks the most user-friendly asset for a platform, honouring extension order. */
function pickAsset(assets: ReleaseAsset[], platform: Platform): ReleaseAsset | undefined {
  for (const extension of platform.extensions) {
    const match = assets.find((a) => a.name.includes(platform.slug) && a.name.endsWith(extension));
    if (match) return match;
  }
  return undefined;
}

function formatSize(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function Downloads() {
  const [release, setRelease] = useState<Release | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'none'>('loading');

  useEffect(() => {
    let cancelled = false;
    fetch(`https://api.github.com/repos/${REPO}/releases/latest`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: Release) => {
        if (cancelled) return;
        setRelease(data);
        setState('ready');
      })
      .catch(() => {
        if (!cancelled) setState('none');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="download" className="border-t border-rule py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">Download</h2>
          {state === 'ready' && release && (
            <a href={release.html_url} className="link font-mono text-xs">
              {release.tag_name}
              {release.published_at
                ? ` · ${new Date(release.published_at).toLocaleDateString()}`
                : ''}
            </a>
          )}
        </div>
        <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-text-secondary">
          Native builds for every desktop platform. No account, no telemetry, no licence key.
        </p>

        <div className="mt-8 grid gap-px overflow-hidden border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-4">
          {PLATFORMS.map((platform) => {
            const asset = release ? pickAsset(release.assets, platform) : undefined;
            return (
              <div key={platform.id} className="flex flex-col gap-3 bg-surface-1 p-5">
                <platform.icon className="h-5 w-5 text-text-muted" strokeWidth={1.5} />
                <div>
                  <p className="text-[13px] font-medium text-text-primary">{platform.label}</p>
                  <p className="text-xs text-text-muted">{platform.detail}</p>
                </div>
                {asset ? (
                  <a
                    href={asset.browser_download_url}
                    className="mt-auto inline-flex h-8 items-center justify-center border border-accent bg-accent px-3 text-xs font-medium text-black hover:bg-accent-ink hover:border-accent-ink"
                  >
                    Download · {formatSize(asset.size)}
                  </a>
                ) : (
                  <span className="mt-auto inline-flex h-8 items-center justify-center border border-rule px-3 text-xs text-text-muted">
                    {state === 'loading' ? 'Checking…' : 'Not published yet'}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-xs text-text-muted">
          Prefer to build it yourself?{' '}
          <a href={`https://github.com/${REPO}`} className="link">
            Clone the repository
          </a>{' '}
          and run <code className="font-mono text-text-secondary">pnpm dev</code>.
        </p>
      </div>
    </section>
  );
}
