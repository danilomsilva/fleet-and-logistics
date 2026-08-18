import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { axe } from 'vitest-axe'
import { db } from '@/mock-api/db'
import { MaintenanceDetailPage } from './MaintenanceDetailPage'

function renderDetail(id: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/maintenance/${id}`]}>
        <Routes>
          <Route path="/maintenance/:id" element={<MaintenanceDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('MaintenanceDetailPage', () => {
  it('loads the record and shows its details', async () => {
    const target = db.maintenanceRecords[0]
    renderDetail(target.id)

    expect(await screen.findByRole('heading', { name: target.id })).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
  })

  it('shows an error state for an unknown record', async () => {
    renderDetail('does-not-exist')
    expect(await screen.findByText("Couldn't load maintenance record")).toBeInTheDocument()
  })

  it('has no detectable accessibility violations once loaded', async () => {
    const target = db.maintenanceRecords[0]
    const { container } = renderDetail(target.id)
    await screen.findByRole('heading', { name: target.id })

    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})
