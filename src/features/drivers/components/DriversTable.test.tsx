import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { axe } from 'vitest-axe'
import { DriversTable } from './DriversTable'

function renderTable() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <DriversTable />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('DriversTable', () => {
  it('loads and renders driver rows', async () => {
    renderTable()
    await waitFor(() => expect(screen.getAllByRole('row').length).toBeGreaterThan(1))
  })

  it('has no detectable accessibility violations once loaded', async () => {
    const { container } = renderTable()
    await waitFor(() => expect(screen.getAllByRole('row').length).toBeGreaterThan(1))
    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})
