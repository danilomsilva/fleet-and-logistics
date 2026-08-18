import { CalendarClock, CheckCircle2, Clock, Flag, Wrench } from 'lucide-react'
import type { StatusTone } from '@/shared/components/status-badge/StatusBadge'
import type { MaintenancePriority, MaintenanceStatus } from '@/mock-api/schemas/maintenance'

export const MAINTENANCE_STATUS_CONFIG: Record<
  MaintenanceStatus,
  { label: string; tone: StatusTone; icon: typeof Clock }
> = {
  scheduled: { label: 'Scheduled', tone: 'info', icon: CalendarClock },
  due: { label: 'Due', tone: 'warning', icon: Clock },
  in_progress: { label: 'In progress', tone: 'info', icon: Wrench },
  completed: { label: 'Completed', tone: 'success', icon: CheckCircle2 },
}

export const MAINTENANCE_PRIORITY_CONFIG: Record<
  MaintenancePriority,
  { label: string; tone: StatusTone; icon: typeof Flag }
> = {
  low: { label: 'Low', tone: 'neutral', icon: Flag },
  medium: { label: 'Medium', tone: 'info', icon: Flag },
  high: { label: 'High', tone: 'warning', icon: Flag },
}
