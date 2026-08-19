import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Vehicle, VehicleInput } from '@/mock-api/schemas/vehicle'
import { vehicleKeys } from './query-keys'
import { driverKeys } from '@/features/drivers/hooks/query-keys'

interface UpdateVehicleInput {
  id: string
  input: VehicleInput
}

async function updateVehicle({ id, input }: UpdateVehicleInput): Promise<Vehicle> {
  const res = await fetch(`/api/vehicles/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to update vehicle')
  return res.json()
}

/** Full-record edit (name/registration/type/status/driver/mileage) — distinct
 * from useUpdateVehicleStatus, which only handles the bulk status action. */
export function useUpdateVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateVehicle,
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: driverKeys.all })
    },
  })
}
