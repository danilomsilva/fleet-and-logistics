import { useMutation, useQueryClient } from '@tanstack/react-query'
import { maintenanceKeys } from './query-keys'

async function deleteMaintenanceRecord(id: string): Promise<void> {
  const res = await fetch(`/api/maintenance/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete maintenance record')
}

export function useDeleteMaintenanceRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteMaintenanceRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.lists() })
    },
  })
}
