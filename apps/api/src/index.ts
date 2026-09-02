import { createServer } from 'node:http';

const PORT = Number(process.env.API_PORT ?? 8787);

/**
 * Placeholder API server. RepoLens v1 talks to the GitHub REST API directly
 * from the browser using a personal access token (see apps/web Settings).
 *
 * This service is the future home of the GitHub OAuth web flow, which needs a
 * server to exchange the OAuth `code` for an access token without exposing
 * the client secret to the browser. See CONTRIBUTING.md for the roadmap.
 */
const server = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  res.writeHead(404, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ error: 'not found' }));
});

server.listen(PORT, () => {
  console.log(`@repolens/api listening on http://localhost:${PORT}`);
});
