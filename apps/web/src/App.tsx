import { BrowserRouter, HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Landing } from './pages/Landing.js';
import { RepoShell } from './pages/RepoShell.js';
import { Overview } from './pages/Overview.js';
import { RepoMap } from './pages/RepoMap.js';
import { Files } from './pages/Files.js';
import { Commits } from './pages/Commits.js';
import { Branches } from './pages/Branches.js';
import { Contributors } from './pages/Contributors.js';
import { Settings } from './pages/Settings.js';
import { ComingSoon } from './pages/ComingSoon.js';

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

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/:owner/:repo" element={<RepoShell />}>
            <Route index element={<Overview />} />
            <Route path="map" element={<RepoMap />} />
            <Route path="files/*" element={<Files />} />
            <Route path="commits" element={<Commits />} />
            <Route path="branches" element={<Branches />} />
            <Route path="contributors" element={<Contributors />} />
            <Route path="dependencies" element={<ComingSoon title="Dependencies" />} />
            <Route path="activity" element={<ComingSoon title="Activity" />} />
            <Route path="pulls" element={<ComingSoon title="Pull Requests" />} />
            <Route path="issues" element={<ComingSoon title="Issues" />} />
            <Route path="releases" element={<ComingSoon title="Releases" />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}
