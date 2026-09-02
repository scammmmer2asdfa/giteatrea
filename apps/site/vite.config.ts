import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves this project at /<repo>/, so assets need that prefix.
// Set SITE_BASE=/ when hosting at a domain root instead.
export default defineConfig({
  base: process.env.SITE_BASE ?? '/giteatrea/',
  plugins: [react()],
  server: { port: 5174 },
});
