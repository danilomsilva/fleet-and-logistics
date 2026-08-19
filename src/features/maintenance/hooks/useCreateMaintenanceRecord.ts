import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { MaintenanceInput, MaintenanceRecord } from '@/mock-api/schemas/maintenance'
import { maintenanceKeys } from './query-keys'

async function createMaintenanceRecord(input: MaintenanceInput): Promise<MaintenanceRecord> {
  const res = await fetch('/api/maintenance', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to create maintenance record')
  return res.json()
}

export function useCreateMaintenanceRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createMaintenanceRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.lists() })
    },
  })
}
