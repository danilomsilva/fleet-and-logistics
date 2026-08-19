import { useMutation, useQueryClient } from '@tanstack/react-query'
import { vehicleKeys } from './query-keys'
import { driverKeys } from '@/features/drivers/hooks/query-keys'
import { maintenanceKeys } from '@/features/maintenance/hooks/query-keys'

async function deleteVehicle(id: string): Promise<void> {
  const res = await fetch(`/api/vehicles/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete vehicle')
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: driverKeys.all })
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.all })
    },
  })
}
