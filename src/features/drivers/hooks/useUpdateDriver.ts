import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Driver, DriverInput } from '@/mock-api/schemas/driver'
import { driverKeys } from './query-keys'
import { vehicleKeys } from '@/features/vehicles/hooks/query-keys'

interface UpdateDriverInput {
  id: string
  input: DriverInput
}

async function updateDriver({ id, input }: UpdateDriverInput): Promise<Driver> {
  const res = await fetch(`/api/drivers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to update driver')
  return res.json()
}

/** Full-record edit (name/status/assigned vehicle) — distinct from
 * useUpdateDriverStatus, which only handles the bulk status action. */
export function useUpdateDriver() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateDriver,
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: driverKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: driverKeys.lists() })
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all })
    },
  })
}
