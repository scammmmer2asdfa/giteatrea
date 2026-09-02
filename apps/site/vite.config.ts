import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Defaults to a root base so Vercel/Netlify/custom domains work untouched.
// GitHub Pages serves under /<repo>/ and sets SITE_BASE accordingly.
export default defineConfig({
  base: process.env.SITE_BASE || '/',
  plugins: [react()],
  server: { port: 5174 },
});
