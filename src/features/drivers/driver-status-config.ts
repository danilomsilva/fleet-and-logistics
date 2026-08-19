import { Car, Coffee, CircleCheck, Moon, PowerOff, Sun, Sunset } from 'lucide-react'
import type { StatusTone } from '@/shared/components/status-badge/StatusBadge'
import type { DriverShift, DriverStatus } from '@/mock-api/schemas/driver'

export const DRIVER_STATUS_CONFIG: Record<
  DriverStatus,
  { label: string; tone: StatusTone; icon: typeof CircleCheck }
> = {
  available: { label: 'Available', tone: 'success', icon: CircleCheck },
  driving: { label: 'Driving', tone: 'info', icon: Car },
  on_break: { label: 'On break', tone: 'warning', icon: Coffee },
  offline: { label: 'Not Available', tone: 'neutral', icon: PowerOff },
}

export const DRIVER_SHIFT_CONFIG: Record<DriverShift, { label: string; icon: typeof Sun }> = {
  morning: { label: 'Morning', icon: Sun },
  afternoon: { label: 'Afternoon', icon: Sunset },
  overnight: { label: 'Overnight', icon: Moon },
}
