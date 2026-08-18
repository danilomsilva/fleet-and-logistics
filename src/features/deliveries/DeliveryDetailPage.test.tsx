import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { axe } from 'vitest-axe'
import { db } from '@/mock-api/db'
import { DeliveryDetailPage } from './DeliveryDetailPage'

function renderDetail(id: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/deliveries/${id}`]}>
        <Routes>
          <Route path="/deliveries/:id" element={<DeliveryDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('DeliveryDetailPage', () => {
  it('loads the delivery and shows its details', async () => {
    const target = db.deliveries[0]
    renderDetail(target.id)

    expect(await screen.findByRole('heading', { name: target.id })).toBeInTheDocument()
    expect(screen.getByText('Customer')).toBeInTheDocument()
  })

  it('shows an error state for an unknown delivery', async () => {
    renderDetail('does-not-exist')
    expect(await screen.findByText("Couldn't load delivery")).toBeInTheDocument()
  })

  it('has no detectable accessibility violations once loaded', async () => {
    const target = db.deliveries[0]
    const { container } = renderDetail(target.id)
    await screen.findByRole('heading', { name: target.id })

    const results = await axe(container)
    expect(results.violations).toEqual([])
  })
})
