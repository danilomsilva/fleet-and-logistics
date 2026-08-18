import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Vehicle, VehicleStatus } from '@/mock-api/schemas/vehicle'
import { vehicleKeys } from './query-keys'

interface UpdateStatusInput {
  id: string
  status: VehicleStatus
}

async function updateVehicleStatus({ id, status }: UpdateStatusInput): Promise<Vehicle> {
  const res = await fetch(`/api/vehicles/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error('Failed to update vehicle status')
  return res.json()
}

/** Used for the Vehicles table's bulk status actions (spec section 4). */
export function useUpdateVehicleStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateVehicleStatus,
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() })
    },
  })
}
