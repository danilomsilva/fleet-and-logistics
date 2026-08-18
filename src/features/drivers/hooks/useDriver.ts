import { useQuery } from '@tanstack/react-query'
import type { Driver } from '@/mock-api/schemas/driver'
import { driverKeys } from './query-keys'

async function fetchDriver(id: string): Promise<Driver> {
  const res = await fetch(`/api/drivers/${id}`)
  if (!res.ok) throw new Error('Failed to load driver')
  return res.json()
}

export function useDriver(id: string) {
  return useQuery({
    queryKey: driverKeys.detail(id),
    queryFn: () => fetchDriver(id),
    enabled: !!id,
  })
}
