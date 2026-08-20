import type { Vehicle, VehicleServiceStatus } from './schemas/vehicle'
import type { ServiceRecord, ServiceStatus } from './schemas/service'

const DUE_SOON_THRESHOLD_DAYS = 31

function daysUntil(date: string, now: Date): number {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  return Math.round(
    (startOfDay(new Date(date)).getTime() - startOfDay(now).getTime()) / (1000 * 60 * 60 * 24),
  )
}

export function computeVehicleServiceStatus(
  vehicle: Pick<Vehicle, 'nextServiceDate'>,
  now = new Date(),
): VehicleServiceStatus {
  if (!vehicle.nextServiceDate) return 'up_to_date'

  const days = daysUntil(vehicle.nextServiceDate, now)
  if (days <= 0) return 'overdue'
  if (days < DUE_SOON_THRESHOLD_DAYS) return 'due_soon'
  return 'up_to_date'
}

/** Mirrors computeVehicleServiceStatus's 30-day threshold: a not-yet-started
 * record within 30 days of its scheduled date (or already past it) is 'due',
 * otherwise 'scheduled'. Records already in progress or completed are left
 * as-is — those transitions are explicit user actions, not date-driven. */
export function computeServiceRecordStatus(
  record: Pick<ServiceRecord, 'status' | 'scheduledDate'>,
  now = new Date(),
): ServiceStatus {
  if (record.status === 'in_progress' || record.status === 'completed') return record.status
  return daysUntil(record.scheduledDate, now) < DUE_SOON_THRESHOLD_DAYS ? 'due' : 'scheduled'
}
