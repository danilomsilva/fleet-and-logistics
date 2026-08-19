import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Vehicle, VehicleInput } from '@/mock-api/schemas/vehicle'
import { vehicleKeys } from './query-keys'
import { driverKeys } from '@/features/drivers/hooks/query-keys'

async function createVehicle(input: VehicleInput): Promise<Vehicle> {
  const res = await fetch('/api/vehicles', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to create vehicle')
  return res.json()
}

export function useCreateVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: driverKeys.all })
    },
  })
}
