import { AlertTriangle, CheckCircle2, Eye } from 'lucide-react'
import type { StatusTone } from '@/shared/components/status-badge/StatusBadge'
import type { AlertStatus } from '@/mock-api/schemas/alert'

export const ALERT_STATUS_CONFIG: Record<
  AlertStatus,
  { label: string; tone: StatusTone; icon: typeof CheckCircle2 }
> = {
  active: { label: 'Active', tone: 'danger', icon: AlertTriangle },
  acknowledged: { label: 'Acknowledged', tone: 'warning', icon: Eye },
  resolved: { label: 'Resolved', tone: 'success', icon: CheckCircle2 },
}
