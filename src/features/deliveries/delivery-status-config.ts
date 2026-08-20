import { AlertTriangle, CheckCircle2, Clock, Flag, Truck } from 'lucide-react'
import type { StatusTone } from '@/shared/components/status-badge/StatusBadge'
import type { DeliveryPriority, DeliveryStatus } from '@/mock-api/schemas/delivery'

export const DELIVERY_STATUS_CONFIG: Record<
  DeliveryStatus,
  { label: string; tone: StatusTone; icon: typeof Clock }
> = {
  new: { label: 'New', tone: 'neutral', icon: Clock },
  in_transit: { label: 'In transit', tone: 'info', icon: Truck },
  delivered: { label: 'Delivered', tone: 'success', icon: CheckCircle2 },
  delayed: { label: 'Delayed', tone: 'warning', icon: AlertTriangle },
}

export const DELIVERY_PRIORITY_CONFIG: Record<
  DeliveryPriority,
  { label: string; tone: StatusTone; icon: typeof Flag }
> = {
  low: { label: 'Low', tone: 'neutral', icon: Flag },
  medium: { label: 'Medium', tone: 'info', icon: Flag },
  high: { label: 'High', tone: 'warning', icon: Flag },
  urgent: { label: 'Urgent', tone: 'danger', icon: Flag },
}
