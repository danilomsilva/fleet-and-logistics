import { useQuery } from '@tanstack/react-query'
import type { MaintenanceRecord } from '@/mock-api/schemas/maintenance'
import { maintenanceKeys } from './query-keys'

async function fetchMaintenanceRecord(id: string): Promise<MaintenanceRecord> {
  const res = await fetch(`/api/maintenance/${id}`)
  if (!res.ok) throw new Error('Failed to load maintenance record')
  return res.json()
}

export function useMaintenanceRecord(id: string) {
  return useQuery({
    queryKey: maintenanceKeys.detail(id),
    queryFn: () => fetchMaintenanceRecord(id),
    enabled: !!id,
  })
}
