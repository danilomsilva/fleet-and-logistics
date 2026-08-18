import { AlertTriangle, CheckCircle2, Eye, Info, OctagonAlert, ShieldAlert } from 'lucide-react'
import type { StatusTone } from '@/shared/components/status-badge/StatusBadge'
import type { AlertPriority, AlertStatus } from '@/mock-api/schemas/alert'

export const ALERT_STATUS_CONFIG: Record<
  AlertStatus,
  { label: string; tone: StatusTone; icon: typeof CheckCircle2 }
> = {
  active: { label: 'Active', tone: 'danger', icon: AlertTriangle },
  acknowledged: { label: 'Acknowledged', tone: 'warning', icon: Eye },
  resolved: { label: 'Resolved', tone: 'success', icon: CheckCircle2 },
}

export const ALERT_PRIORITY_CONFIG: Record<
  AlertPriority,
  { label: string; tone: StatusTone; icon: typeof Info }
> = {
  low: { label: 'Low', tone: 'neutral', icon: Info },
  medium: { label: 'Medium', tone: 'info', icon: Info },
  high: { label: 'High', tone: 'warning', icon: ShieldAlert },
  critical: { label: 'Critical', tone: 'danger', icon: OctagonAlert },
}

export const ALERT_PRIORITY_ORDER: Record<AlertPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}
