import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router'
import { queryClient } from '@/shared/lib/query-client'
import { Toaster } from '@/components/ui/sonner'
import { AppRoutes } from './app/routes'
import { ErrorBoundary } from './app/ErrorBoundary'
import './index.css'

async function enableMocking() {
  const { worker } = await import('./mock-api/browser')
  return worker.start({
    onUnhandledRequest: 'bypass',
    // Respects the /<repo-name>/ subpath the GitHub Pages build is served
    // from (see vite.config.ts) — otherwise the worker script 404s there.
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
  })
}

function renderApp() {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <AppRoutes />
          </BrowserRouter>
          <Toaster />
        </QueryClientProvider>
      </ErrorBoundary>
    </StrictMode>,
  )
}

function renderMockingFailure(error: unknown) {
  console.error('Failed to start the mock API worker:', error)
  const root = document.getElementById('root')!
  root.innerHTML = `
    <div style="display:flex;min-height:100svh;align-items:center;justify-content:center;padding:2rem;font-family:system-ui,sans-serif;text-align:center;">
      <div>
        <h1 style="font-size:1.25rem;font-weight:600;margin-bottom:0.5rem;">FleetOS couldn't start</h1>
        <p style="color:#71717a;">The mock API failed to initialize. Try reloading the page.</p>
      </div>
    </div>
  `
}

enableMocking().then(renderApp).catch(renderMockingFailure)
