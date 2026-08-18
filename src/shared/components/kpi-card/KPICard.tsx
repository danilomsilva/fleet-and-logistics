import { ArrowDown, ArrowUp, Minus, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type TrendDirection = 'up' | 'down' | 'flat'
export type TrendSentiment = 'positive' | 'negative' | 'neutral'

export interface KPITrend {
  direction: TrendDirection
  value: string
  /** Whether this direction is good or bad news — a rising "delayed" count
   * is negative even though its direction is "up". Defaults to 'neutral'. */
  sentiment?: TrendSentiment
}

export interface KPICardProps {
  label: string
  value: string | number
  trend?: KPITrend
  icon?: LucideIcon
  className?: string
}

const DIRECTION_ICON: Record<TrendDirection, LucideIcon> = {
  up: ArrowUp,
  down: ArrowDown,
  flat: Minus,
}

const SENTIMENT_CLASSES: Record<TrendSentiment, string> = {
  positive: 'text-emerald-700 dark:text-emerald-400',
  negative: 'text-red-700 dark:text-red-400',
  neutral: 'text-muted-foreground',
}

export function KPICard({ label, value, trend, icon: Icon, className }: KPICardProps) {
  const TrendIcon = trend ? DIRECTION_ICON[trend.direction] : null

  return (
    <div className={cn('space-y-2 rounded-lg border p-4', className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        {Icon && <Icon aria-hidden="true" className="size-4 text-muted-foreground" />}
      </div>
      <p className="text-2xl font-semibold">{value}</p>
      {trend && TrendIcon && (
        <p
          className={cn(
            'flex items-center gap-1 text-xs font-medium',
            SENTIMENT_CLASSES[trend.sentiment ?? 'neutral'],
          )}
        >
          <TrendIcon aria-hidden="true" className="size-3" />
          {trend.value}
        </p>
      )}
    </div>
  )
}
