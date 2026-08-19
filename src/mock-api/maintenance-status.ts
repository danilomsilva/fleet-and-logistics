import type { Vehicle, VehicleMaintenanceStatus } from './schemas/vehicle'

const DUE_SOON_THRESHOLD_DAYS = 31

export function computeVehicleMaintenanceStatus(
  vehicle: Pick<Vehicle, 'nextServiceDate'>,
  now = new Date(),
): VehicleMaintenanceStatus {
  if (!vehicle.nextServiceDate) return 'up_to_date'

  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const daysUntil = Math.round(
    (startOfDay(new Date(vehicle.nextServiceDate)).getTime() - startOfDay(now).getTime()) /
      (1000 * 60 * 60 * 24),
  )

  if (daysUntil <= 0) return 'overdue'
  if (daysUntil < DUE_SOON_THRESHOLD_DAYS) return 'due_soon'
  return 'up_to_date'
}
