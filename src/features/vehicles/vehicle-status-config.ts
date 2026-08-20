import { AlertTriangle, Car, CircleCheck, Clock, Wrench } from 'lucide-react'
import type { StatusTone } from '@/shared/components/status-badge/StatusBadge'
import type { VehicleServiceStatus, VehicleStatus } from '@/mock-api/schemas/vehicle'

export const VEHICLE_STATUS_CONFIG: Record<
  VehicleStatus,
  { label: string; tone: StatusTone; icon: typeof CircleCheck }
> = {
  available: { label: 'Available', tone: 'success', icon: CircleCheck },
  in_use: { label: 'In use', tone: 'info', icon: Car },
  service: { label: 'Service', tone: 'warning', icon: Wrench },
  broken: { label: 'Broken', tone: 'neutral', icon: AlertTriangle },
}

export const VEHICLE_SERVICE_STATUS_CONFIG: Record<
  VehicleServiceStatus,
  { label: string; tone: StatusTone; icon: typeof CircleCheck }
> = {
  up_to_date: { label: 'OK', tone: 'success', icon: CircleCheck },
  due_soon: { label: 'Due soon', tone: 'warning', icon: Clock },
  overdue: { label: 'Overdue', tone: 'danger', icon: AlertTriangle },
}
