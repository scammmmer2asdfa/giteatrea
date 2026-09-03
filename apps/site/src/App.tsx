import { Logo } from '@repolens/ui';
import { ArrowUpRight, Github } from 'lucide-react';
import { HeroMap } from './HeroMap.js';
import { Downloads } from './Downloads.js';

const REPO = 'https://github.com/scammmmer2asdfa/giteatrea';
// Follows the deployment's base path, so /app/ locally and /giteatrea/app/ on Pages.
const APP = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/app/`;

function Nav() {
  return (
    <header className="sticky top-0 z-20 border-b border-rule bg-surface-1/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-6 px-6">
        <a href="/" className="flex items-center gap-2">
          <Logo className="h-[19px] w-[19px] text-text-primary" />
          <span className="text-[14px] font-semibold tracking-tight">RepoLens</span>
        </a>
        <nav className="ml-auto flex items-center gap-6 text-[13px] text-text-secondary">
          <a href="#how" className="hover:text-text-primary">
            How it works
          </a>
          <a href="#download" className="hover:text-text-primary">
            Download
          </a>
          <a href={REPO} className="flex items-center gap-1.5 hover:text-text-primary">
            <Github className="h-4 w-4" strokeWidth={1.75} />
            Source
          </a>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="border-b border-rule">
      <div className="mx-auto max-w-5xl px-6 pb-16 pt-20">
        <p className="font-mono text-xs text-accent">Open source · MIT</p>
        <h1 className="mt-4 max-w-2xl text-[42px] font-semibold leading-[1.08] tracking-[-0.02em]">
          See a repository before you read it.
        </h1>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-text-secondary">
          Cloning an unfamiliar codebase tells you nothing about its shape. RepoLens draws the whole
          repository as a map — every file sized by its weight — so you know where the code actually
          lives before you open a single one.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="#download"
            className="inline-flex h-10 items-center border border-accent bg-accent px-5 text-[13px] font-medium text-black hover:border-accent-ink hover:bg-accent-ink"
          >
            Download for desktop
          </a>
          <a
            href={APP}
            className="inline-flex h-10 items-center gap-1.5 border border-rule-strong px-5 text-[13px] font-medium text-text-primary hover:bg-surface-2"
          >
            Open in browser
            <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
          </a>
        </div>

        {/* The product's own renderer, not a screenshot. */}
        <figure className="mt-14">
          <div className="field h-[380px] overflow-hidden p-1">
            <HeroMap />
          </div>
          <figcaption className="mt-2.5 font-mono text-xs text-text-muted">
            Every rectangle is a file. Area is byte size. Colour is language.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

const STEPS = [
  {
    n: '01',
    title: 'Paste a repository',
    body: 'A GitHub URL, an owner/repo shorthand, an SSH remote, or just a username to browse what they own.',
  },
  {
    n: '02',
    title: 'Read the map',
    body: 'Directories nest, files are sized by bytes and coloured by language. Click any block to descend into it.',
  },
  {
    n: '03',
    title: 'Follow the history',
    body: 'Commits, branches and contributors sit beside the map, so structure and activity read together.',
  },
];

function How() {
  return (
    <section id="how" className="border-b border-rule py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
        {/* Numbered because these are genuinely sequential. */}
        <ol className="mt-8 grid gap-px border border-rule bg-rule md:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.n} className="bg-surface-1 p-6">
              <span className="font-mono text-xs text-accent">{step.n}</span>
              <h3 className="mt-3 text-[15px] font-medium text-text-primary">{step.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const FACTS: [string, string][] = [
  ['Licence', 'MIT'],
  ['Telemetry', 'None'],
  ['Account required', 'No'],
  ['Data stored', 'Your token, in your browser'],
  ['Platforms', 'macOS · Windows · Linux · Web'],
  ['Bundle size', '82 kB gzipped'],
];

function Facts() {
  return (
    <section className="border-b border-rule py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-2xl font-semibold tracking-tight">The short version</h2>
        <dl className="mt-8 max-w-2xl">
          {FACTS.map(([label, value]) => (
            <div key={label} className="readout border-b border-rule py-2.5">
              <dt className="text-[13px] text-text-secondary">{label}</dt>
              <dd className="tabular font-mono text-[13px] text-text-primary">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-10">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-6 text-xs text-text-muted">
        <Logo className="h-4 w-4 text-text-muted" />
        <span>RepoLens</span>
        <a href={REPO} className="hover:text-text-secondary">
          GitHub
        </a>
        <a href={`${REPO}/blob/main/LICENSE`} className="hover:text-text-secondary">
          MIT Licence
        </a>
        <a href={`${REPO}/issues`} className="hover:text-text-secondary">
          Report an issue
        </a>
        <span className="ml-auto">Not affiliated with GitHub, Inc.</span>
      </div>
    </footer>
  );
}

export function App() {
  return (
    <div className="min-h-screen bg-surface text-text-primary">
      <Nav />
      <main>
        <Hero />
        <How />
        <Facts />
        <Downloads />
      </main>
      <Footer />
    </div>
  );
}
