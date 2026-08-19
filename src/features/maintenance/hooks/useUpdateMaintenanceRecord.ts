import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { MaintenanceInput, MaintenanceRecord } from '@/mock-api/schemas/maintenance'
import { maintenanceKeys } from './query-keys'

interface UpdateMaintenanceRecordInput {
  id: string
  input: MaintenanceInput
}

async function updateMaintenanceRecord({
  id,
  input,
}: UpdateMaintenanceRecordInput): Promise<MaintenanceRecord> {
  const res = await fetch(`/api/maintenance/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to update maintenance record')
  return res.json()
}

/** Full-record edit (vehicle/type/priority/scheduledDate/mileage/description/notes) —
 * distinct from useUpdateMaintenanceStatus, which only handles Start/Complete. */
export function useUpdateMaintenanceRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateMaintenanceRecord,
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.lists() })
    },
  })
}
