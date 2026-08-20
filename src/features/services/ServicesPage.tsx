import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FilterDropdown } from '@/shared/components/filter-dropdown/FilterDropdown'
import { useUrlFilters } from '@/shared/hooks/use-url-filters'
import { useVehicles } from '@/features/vehicles/hooks/useVehicles'
import { servicePrioritySchema, serviceStatusSchema } from '@/mock-api/schemas/service'
import { SERVICE_PRIORITY_CONFIG, SERVICE_STATUS_CONFIG } from './service-status-config'
import { serviceFiltersSchema } from './services-filters'
import { ServicesTable } from './components/ServicesTable'
import { ServiceFormDialog } from './components/ServiceFormDialog'

const STATUS_ITEMS: Record<string, string> = {
  all: 'All statuses',
  ...Object.fromEntries(
    serviceStatusSchema.options.map((status) => [status, SERVICE_STATUS_CONFIG[status].label]),
  ),
}

const PRIORITY_ITEMS: Record<string, string> = {
  all: 'All priorities',
  ...Object.fromEntries(
    servicePrioritySchema.options.map((priority) => [
      priority,
      SERVICE_PRIORITY_CONFIG[priority].label,
    ]),
  ),
}

export function ServicesPage() {
  const [addOpen, setAddOpen] = useState(false)
  const { filters, setFilters } = useUrlFilters(serviceFiltersSchema)
  const { data: vehiclesData } = useVehicles({ pageSize: 200 })
  const vehicleItems: Record<string, string> = {
    all: 'All vehicles',
    ...Object.fromEntries((vehiclesData?.data ?? []).map((vehicle) => [vehicle.id, vehicle.name])),
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Services</h1>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Search</span>
            <Input
              placeholder="Search descriptions…"
              value={filters.q}
              onChange={(e) => setFilters({ q: e.target.value })}
              className="w-56"
            />
          </div>
          <FilterDropdown
            groups={[
              {
                label: 'Status',
                value: filters.status || 'all',
                onValueChange: (value) => setFilters({ status: value === 'all' ? '' : value }),
                items: STATUS_ITEMS,
              },
              {
                label: 'Priority',
                value: filters.priority || 'all',
                onValueChange: (value) => setFilters({ priority: value === 'all' ? '' : value }),
                items: PRIORITY_ITEMS,
              },
              {
                label: 'Vehicle',
                value: filters.vehicleId || 'all',
                onValueChange: (value) => setFilters({ vehicleId: value === 'all' ? '' : value }),
                items: vehicleItems,
              },
            ]}
          />
          <Button onClick={() => setAddOpen(true)}>
            <Plus aria-hidden="true" />
            Add Service
          </Button>
        </div>
      </div>
      <ServicesTable />
      {addOpen && <ServiceFormDialog onOpenChange={setAddOpen} />}
    </div>
  )
}
