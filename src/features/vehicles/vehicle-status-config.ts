import { AlertTriangle, Car, CircleCheck, Clock, PowerOff, Wrench } from 'lucide-react'
import type { StatusTone } from '@/shared/components/status-badge/StatusBadge'
import type { VehicleMaintenanceStatus, VehicleStatus } from '@/mock-api/schemas/vehicle'

export const VEHICLE_STATUS_CONFIG: Record<
  VehicleStatus,
  { label: string; tone: StatusTone; icon: typeof CircleCheck }
> = {
  available: { label: 'Available', tone: 'success', icon: CircleCheck },
  in_use: { label: 'In use', tone: 'info', icon: Car },
  maintenance: { label: 'Maintenance', tone: 'warning', icon: Wrench },
  offline: { label: 'Offline', tone: 'neutral', icon: PowerOff },
}

export const VEHICLE_MAINTENANCE_STATUS_CONFIG: Record<
  VehicleMaintenanceStatus,
  { label: string; tone: StatusTone; icon: typeof CircleCheck }
> = {
  up_to_date: { label: 'Up to date', tone: 'success', icon: CircleCheck },
  due_soon: { label: 'Due soon', tone: 'warning', icon: Clock },
  overdue: { label: 'Overdue', tone: 'danger', icon: AlertTriangle },
}
