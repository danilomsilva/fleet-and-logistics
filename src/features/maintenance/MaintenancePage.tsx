import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUrlFilters } from '@/shared/hooks/use-url-filters'
import { useVehicles } from '@/features/vehicles/hooks/useVehicles'
import { maintenancePrioritySchema, maintenanceStatusSchema } from '@/mock-api/schemas/maintenance'
import { MAINTENANCE_PRIORITY_CONFIG, MAINTENANCE_STATUS_CONFIG } from './maintenance-status-config'
import { maintenanceFiltersSchema } from './maintenance-filters'
import { MaintenanceTable } from './components/MaintenanceTable'
import { MaintenanceFormDialog } from './components/MaintenanceFormDialog'

const STATUS_ITEMS: Record<string, string> = {
  all: 'All statuses',
  ...Object.fromEntries(
    maintenanceStatusSchema.options.map((status) => [
      status,
      MAINTENANCE_STATUS_CONFIG[status].label,
    ]),
  ),
}

const PRIORITY_ITEMS: Record<string, string> = {
  all: 'All priorities',
  ...Object.fromEntries(
    maintenancePrioritySchema.options.map((priority) => [
      priority,
      MAINTENANCE_PRIORITY_CONFIG[priority].label,
    ]),
  ),
}

export function MaintenancePage() {
  const [addOpen, setAddOpen] = useState(false)
  const { filters, setFilters } = useUrlFilters(maintenanceFiltersSchema)
  const { data: vehiclesData } = useVehicles({ pageSize: 200 })
  const vehicleItems: Record<string, string> = {
    all: 'All vehicles',
    ...Object.fromEntries((vehiclesData?.data ?? []).map((vehicle) => [vehicle.id, vehicle.name])),
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Maintenance</h1>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Search</span>
            <Input
              placeholder="Search descriptions…"
              value={filters.q}
              onChange={(e) => setFilters({ q: e.target.value })}
              className="w-56"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Status</span>
            <Select
              items={STATUS_ITEMS}
              value={filters.status || 'all'}
              onValueChange={(value) =>
                setFilters({ status: !value || value === 'all' ? '' : value })
              }
            >
              <SelectTrigger className="w-40" aria-label="Filter by status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_ITEMS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Priority</span>
            <Select
              items={PRIORITY_ITEMS}
              value={filters.priority || 'all'}
              onValueChange={(value) =>
                setFilters({ priority: !value || value === 'all' ? '' : value })
              }
            >
              <SelectTrigger className="w-40" aria-label="Filter by priority">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PRIORITY_ITEMS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Vehicle</span>
            <Select
              items={vehicleItems}
              value={filters.vehicleId || 'all'}
              onValueChange={(value) =>
                setFilters({ vehicleId: !value || value === 'all' ? '' : value })
              }
            >
              <SelectTrigger className="w-40" aria-label="Filter by vehicle">
                <SelectValue placeholder="Vehicle" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(vehicleItems).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus aria-hidden="true" />
            Add maintenance
          </Button>
        </div>
      </div>
      <MaintenanceTable />
      {addOpen && <MaintenanceFormDialog onOpenChange={setAddOpen} />}
    </div>
  )
}
