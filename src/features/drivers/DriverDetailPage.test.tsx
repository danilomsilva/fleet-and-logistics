import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { axe } from 'vitest-axe'
import { db } from '@/mock-api/db'
import { DriverDetailPage } from './DriverDetailPage'

function renderDetail(id: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/drivers/${id}`]}>
        <Routes>
          <Route path="/drivers/:id" element={<DriverDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('DriverDetailPage', () => {
  it('loads the driver and shows the Overview tab by default', async () => {
    const target = db.drivers[0]
    renderDetail(target.id)

    expect(await screen.findByRole('heading', { name: target.name })).toBeInTheDocument()
    expect(screen.getByText('Availability')).toBeInTheDocument()
  })

  it('has no detectable accessibility violations once loaded', async () => {
    const target = db.drivers[0]
    const { container } = renderDetail(target.id)
    await screen.findByRole('heading', { name: target.name })

    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})
