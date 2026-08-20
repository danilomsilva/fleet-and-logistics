import { useMemo } from 'react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { Vehicle, VehicleStatus } from '@/mock-api/schemas/vehicle'
import { vehicleStatusSchema } from '@/mock-api/schemas/vehicle'
import { VEHICLE_STATUS_CONFIG } from '@/features/vehicles/vehicle-status-config'
import { TONE_CHART_COLOR } from '@/shared/lib/chart-colors'

export interface FleetStatusChartProps {
  vehicles: Vehicle[]
}

/** Donut breakdown of the fleet by status — the shape (proportion, not just
 * count) is the point: a fleet that's mostly "in use" reads very differently
 * at a glance than one that's mostly idle or down for service. */
export function FleetStatusChart({ vehicles }: FleetStatusChartProps) {
  const chartData = useMemo(
    () =>
      vehicleStatusSchema.options
        .map((status: VehicleStatus) => {
          const config = VEHICLE_STATUS_CONFIG[status]
          return {
            status,
            name: config.label,
            value: vehicles.filter((v) => v.status === status).length,
            fill: TONE_CHART_COLOR[config.tone],
          }
        })
        .filter((entry) => entry.value > 0),
    [vehicles],
  )

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <h2 className="text-sm font-medium">Fleet status</h2>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius="55%"
              outerRadius="80%"
              paddingAngle={2}
            >
              {chartData.map((entry) => (
                <Cell key={entry.status} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{ fontSize: 12 }}
              iconType="circle"
              iconSize={8}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
