import { BrowserRouter, HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './components/ThemeProvider.js';
import { Landing } from './pages/Landing.js';
import { RepoShell } from './pages/RepoShell.js';
import { Overview } from './pages/Overview.js';
import { RepoMap } from './pages/RepoMap.js';
import { Files } from './pages/Files.js';
import { Commits } from './pages/Commits.js';
import { Branches } from './pages/Branches.js';
import { Contributors } from './pages/Contributors.js';
import { Settings, StandaloneSettings } from './pages/Settings.js';
import { Owner } from './pages/Owner.js';
import { PullRequests } from './pages/PullRequests.js';
import { Issues } from './pages/Issues.js';
import { Releases } from './pages/Releases.js';
import { Dependencies } from './pages/Dependencies.js';
import { Activity } from './pages/Activity.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// The desktop shell serves from a custom protocol with no server to resolve a
// reloaded deep path, so it needs hash routing. The web build keeps clean URLs.
const isDesktop = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
const Router = isDesktop ? HashRouter : BrowserRouter;

// Matches Vite's base so the app still routes when mounted at /app/.
const basename = isDesktop ? undefined : import.meta.env.BASE_URL;

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router basename={basename}>
          <Routes>
            <Route path="/" element={<Landing />} />
            {/* Static segments outrank the dynamic :owner route, so these stay reachable. */}
            <Route path="/settings" element={<StandaloneSettings />} />
            <Route path="/:owner" element={<Owner />} />
            <Route path="/:owner/:repo" element={<RepoShell />}>
              <Route index element={<Overview />} />
              <Route path="map" element={<RepoMap />} />
              <Route path="files/*" element={<Files />} />
              <Route path="commits" element={<Commits />} />
              <Route path="branches" element={<Branches />} />
              <Route path="contributors" element={<Contributors />} />
              <Route path="dependencies" element={<Dependencies />} />
              <Route path="activity" element={<Activity />} />
              <Route path="pulls" element={<PullRequests />} />
              <Route path="issues" element={<Issues />} />
              <Route path="releases" element={<Releases />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
