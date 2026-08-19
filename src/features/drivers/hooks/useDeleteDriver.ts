import { useMutation, useQueryClient } from '@tanstack/react-query'
import { driverKeys } from './query-keys'
import { vehicleKeys } from '@/features/vehicles/hooks/query-keys'

async function deleteDriver(id: string): Promise<void> {
  const res = await fetch(`/api/drivers/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete driver')
}

export function useDeleteDriver() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteDriver,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: driverKeys.lists() })
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all })
    },
  })
}
