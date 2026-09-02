import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// WEB_BASE lets the marketing site mount this app on a subpath (/app/) so a
// single deployment serves both. Standalone deploys keep the root.
export default defineConfig({
  base: process.env.WEB_BASE || '/',
  plugins: [react()],
  server: {
    port: 5173,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
});
