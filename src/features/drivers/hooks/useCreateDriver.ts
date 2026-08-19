import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Driver, DriverInput } from '@/mock-api/schemas/driver'
import { driverKeys } from './query-keys'
import { vehicleKeys } from '@/features/vehicles/hooks/query-keys'

async function createDriver(input: DriverInput): Promise<Driver> {
  const res = await fetch('/api/drivers', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to create driver')
  return res.json()
}

export function useCreateDriver() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createDriver,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: driverKeys.lists() })
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all })
    },
  })
}
