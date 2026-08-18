import { Car, Coffee, CircleCheck, PowerOff } from 'lucide-react'
import type { StatusTone } from '@/shared/components/status-badge/StatusBadge'
import type { DriverStatus } from '@/mock-api/schemas/driver'

export const DRIVER_STATUS_CONFIG: Record<
  DriverStatus,
  { label: string; tone: StatusTone; icon: typeof CircleCheck }
> = {
  available: { label: 'Available', tone: 'success', icon: CircleCheck },
  driving: { label: 'Driving', tone: 'info', icon: Car },
  on_break: { label: 'On break', tone: 'warning', icon: Coffee },
  offline: { label: 'Offline', tone: 'neutral', icon: PowerOff },
}
