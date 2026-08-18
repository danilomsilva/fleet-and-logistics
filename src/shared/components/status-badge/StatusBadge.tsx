import type { LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type StatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger'

const TONE_CLASSES: Record<StatusTone, string> = {
  neutral: 'bg-muted text-muted-foreground border-border',
  info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900',
  success:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900',
  warning:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900',
  danger:
    'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900',
}

export interface StatusBadgeProps {
  label: string
  tone: StatusTone
  icon?: LucideIcon
  className?: string
}

/**
 * Every status is communicated by icon + text together, never color alone
 * (spec section 12). Domain code maps its own status enums to a
 * {label, tone, icon} config and passes it in here.
 */
export function StatusBadge({ label, tone, icon: Icon, className }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn(TONE_CLASSES[tone], className)}>
      {Icon && <Icon aria-hidden="true" />}
      {label}
    </Badge>
  )
}
