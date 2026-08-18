import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Delivery, DeliveryStatus } from '@/mock-api/schemas/delivery'
import { deliveryStatusSchema } from '@/mock-api/schemas/delivery'
import { DELIVERY_STATUS_CONFIG } from '@/features/deliveries/delivery-status-config'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const PERIODS = [
  { key: 'today', label: 'Today', days: 1 },
  { key: '7d', label: '7d', days: 7 },
  { key: '30d', label: '30d', days: 30 },
] as const
type PeriodKey = (typeof PERIODS)[number]['key']

function withinPeriod(scheduledTime: string, days: number): boolean {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  return new Date(scheduledTime).getTime() >= cutoff
}

export interface DeliveryStatusChartProps {
  deliveries: Delivery[]
}

export function DeliveryStatusChart({ deliveries }: DeliveryStatusChartProps) {
  const [period, setPeriod] = useState<PeriodKey>('7d')

  const chartData = useMemo(() => {
    const days = PERIODS.find((p) => p.key === period)!.days
    const inPeriod = deliveries.filter((d) => withinPeriod(d.scheduledTime, days))
    return deliveryStatusSchema.options.map((status: DeliveryStatus) => ({
      status,
      label: DELIVERY_STATUS_CONFIG[status].label,
      count: inPeriod.filter((d) => d.status === status).length,
    }))
  }, [deliveries, period])

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">Deliveries by status</h2>
        <div className="flex gap-1" role="group" aria-label="Time period">
          {PERIODS.map((p) => (
            <Button
              key={p.key}
              type="button"
              size="sm"
              variant={p.key === period ? 'default' : 'outline'}
              aria-pressed={p.key === period}
              className={cn('h-7 px-2 text-xs')}
              onClick={() => setPeriod(p.key)}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" fill="var(--color-primary, #2563eb)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
