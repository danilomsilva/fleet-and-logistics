import { describe, expect, it } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { db } from '@/mock-api/db'
import { useVehicles } from './useVehicles'
import { useVehicle } from './useVehicle'

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('useVehicles', () => {
  it('loads the first page of vehicles', async () => {
    const { result } = renderHook(() => useVehicles(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.data.length).toBeGreaterThan(0)
    expect(result.current.data?.total).toBe(db.vehicles.length)
  })

  it('filters by status', async () => {
    const target = db.vehicles.find((v) => v.status === 'available')
    if (!target) return
    const { result } = renderHook(() => useVehicles({ status: 'available', pageSize: 200 }), {
      wrapper,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.data.every((v) => v.status === 'available')).toBe(true)
  })
})

describe('useVehicle', () => {
  it('loads a single vehicle by id', async () => {
    const target = db.vehicles[0]
    const { result } = renderHook(() => useVehicle(target.id), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.id).toBe(target.id)
  })

  it('surfaces an error for an unknown id', async () => {
    const { result } = renderHook(() => useVehicle('does-not-exist'), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
