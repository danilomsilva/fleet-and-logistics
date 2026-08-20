import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { ServiceRecord, ServiceStatus } from '@/mock-api/schemas/service'
import { serviceStatusSchema } from '@/mock-api/schemas/service'
import { SERVICE_STATUS_CONFIG } from '@/features/services/service-status-config'

export interface ServiceStatusChartProps {
  serviceRecords: ServiceRecord[]
}

export function ServiceStatusChart({ serviceRecords }: ServiceStatusChartProps) {
  const chartData = useMemo(
    () =>
      serviceStatusSchema.options.map((status: ServiceStatus) => ({
        status,
        label: SERVICE_STATUS_CONFIG[status].label,
        count: serviceRecords.filter((r) => r.status === status).length,
      })),
    [serviceRecords],
  )

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <h2 className="text-sm font-medium">Services by status</h2>
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
