import { useMemo } from 'react'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Driver, DriverStatus } from '@/mock-api/schemas/driver'
import { driverStatusSchema } from '@/mock-api/schemas/driver'
import { DRIVER_STATUS_CONFIG } from '@/features/drivers/driver-status-config'
import { TONE_CHART_COLOR } from '@/shared/lib/chart-colors'

export interface DriverAvailabilityChartProps {
  drivers: Driver[]
}

/** Horizontal bars so driver names/status labels stay readable without
 * truncation, and so this chart reads visually distinct from the other
 * vertical bar charts on the dashboard. */
export function DriverAvailabilityChart({ drivers }: DriverAvailabilityChartProps) {
  const chartData = useMemo(
    () =>
      driverStatusSchema.options.map((status: DriverStatus) => {
        const config = DRIVER_STATUS_CONFIG[status]
        return {
          status,
          label: config.label,
          count: drivers.filter((d) => d.status === status).length,
          fill: TONE_CHART_COLOR[config.tone],
        }
      }),
    [drivers],
  )

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <h2 className="text-sm font-medium">Driver availability</h2>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
          >
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fontSize: 12 }}
              width={80}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.status} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
