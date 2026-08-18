import { useQuery } from '@tanstack/react-query'
import type { Vehicle } from '@/mock-api/schemas/vehicle'
import { vehicleKeys } from './query-keys'

async function fetchVehicle(id: string): Promise<Vehicle> {
  const res = await fetch(`/api/vehicles/${id}`)
  if (!res.ok) throw new Error('Failed to load vehicle')
  return res.json()
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: vehicleKeys.detail(id),
    queryFn: () => fetchVehicle(id),
    enabled: !!id,
  })
}
