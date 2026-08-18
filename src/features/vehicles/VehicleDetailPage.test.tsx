import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { axe } from 'vitest-axe'
import { db } from '@/mock-api/db'
import { VehicleDetailPage } from './VehicleDetailPage'

function renderDetail(id: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/vehicles/${id}`]}>
        <Routes>
          <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('VehicleDetailPage', () => {
  it('loads the vehicle and shows the Overview tab by default', async () => {
    const target = db.vehicles[0]
    renderDetail(target.id)

    expect(await screen.findByRole('heading', { name: target.name })).toBeInTheDocument()
    expect(screen.getByText('Registration')).toBeInTheDocument()
  })

  it('shows an error state for an unknown vehicle', async () => {
    renderDetail('does-not-exist')
    expect(await screen.findByText("Couldn't load vehicle")).toBeInTheDocument()
  })

  it('has no detectable accessibility violations once loaded', async () => {
    const target = db.vehicles[0]
    const { container } = renderDetail(target.id)
    await screen.findByRole('heading', { name: target.name })

    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})
