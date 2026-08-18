import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppRoutes } from './routes'

const CASES: [path: string, heading: string][] = [
  ['/', 'Dashboard'],
  ['/dispatch', 'Dispatch'],
  ['/deliveries', 'Deliveries'],
  ['/vehicles', 'Vehicles'],
  ['/drivers', 'Drivers'],
  ['/maintenance', 'Maintenance'],
  ['/alerts', 'Alerts'],
]

describe('AppRoutes', () => {
  it.each(CASES)('path "%s" renders the "%s" heading', async (path, heading) => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[path]}>
          <AppRoutes />
        </MemoryRouter>
      </QueryClientProvider>,
    )
    expect(
      await screen.findByRole('heading', { name: heading }, { timeout: 5000 }),
    ).toBeInTheDocument()
  })
})
