import path from 'node:path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vite.dev/config/
export default defineConfig({
  // Only set for the GitHub Pages build (see .github/workflows/deploy.yml),
  // since the app is served from a /<repo-name>/ subpath there. Local dev,
  // preview, and test all keep the default root base.
  base: process.env.GH_PAGES_BASE ?? '/',
  plugins: [
    react(),
    tailwindcss(),
    // maplibre-gl's worker script has its own relative import
    // (./maplibre-gl-shared.mjs) that only resolves if both files are
    // copied together, unrenamed, into the same output directory — a plain
    // `?url` import copies just the one requested file and silently breaks
    // the worker at runtime (it loads, then dies with no visible error).
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs',
          dest: 'maplibre',
          rename: { stripBase: true },
        },
        {
          src: 'node_modules/maplibre-gl/dist/maplibre-gl-shared.mjs',
          dest: 'maplibre',
          rename: { stripBase: true },
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['maplibre-gl'],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    exclude: ['node_modules', 'dist', 'e2e'],
    // Axe scans combined with full-suite parallelism can exceed the 5s
    // default under load; this matches the headroom already given to
    // Playwright's expect timeout for the same class of flakiness.
    testTimeout: 10000,
  },
})
