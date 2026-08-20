import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { axe } from 'vitest-axe'
import { DashboardPage } from './DashboardPage'

function renderDashboard() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('DashboardPage', () => {
  it('loads and renders KPI cards and widgets', async () => {
    renderDashboard()
    expect(await screen.findByText('Vehicles requiring service')).toBeInTheDocument()
    expect(screen.getByText('Deliveries by status')).toBeInTheDocument()
    expect(screen.getByText('Fleet status')).toBeInTheDocument()
    expect(screen.getByText('Top alerts')).toBeInTheDocument()
    expect(screen.getByText('Driver availability')).toBeInTheDocument()
    expect(screen.getByText('Services by status')).toBeInTheDocument()
  })

  it('has no detectable accessibility violations once loaded', async () => {
    const { container } = renderDashboard()
    await waitFor(() => expect(screen.getByText('Vehicles requiring service')).toBeInTheDocument())
    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})
