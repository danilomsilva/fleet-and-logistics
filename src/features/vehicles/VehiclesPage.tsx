import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FilterDropdown } from '@/shared/components/filter-dropdown/FilterDropdown'
import { useUrlFilters } from '@/shared/hooks/use-url-filters'
import { vehicleStatusSchema, vehicleTypeSchema } from '@/mock-api/schemas/vehicle'
import { VEHICLE_STATUS_CONFIG } from './vehicle-status-config'
import { vehiclesFiltersSchema } from './vehicles-filters'
import { VehiclesTable } from './components/VehiclesTable'
import { VehicleFormDialog } from './components/VehicleFormDialog'

const STATUS_ITEMS: Record<string, string> = {
  all: 'All statuses',
  ...Object.fromEntries(
    vehicleStatusSchema.options.map((status) => [status, VEHICLE_STATUS_CONFIG[status].label]),
  ),
}

const TYPE_ITEMS: Record<string, string> = {
  all: 'All types',
  ...Object.fromEntries(
    vehicleTypeSchema.options.map((type) => [type, type[0].toUpperCase() + type.slice(1)]),
  ),
}

export function VehiclesPage() {
  const [addOpen, setAddOpen] = useState(false)
  const { filters, setFilters } = useUrlFilters(vehiclesFiltersSchema)

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Vehicles</h1>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Search</span>
            <Input
              placeholder="Search vehicles…"
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
                label: 'Type',
                value: filters.type || 'all',
                onValueChange: (value) => setFilters({ type: value === 'all' ? '' : value }),
                items: TYPE_ITEMS,
              },
            ]}
          />
          <Button onClick={() => setAddOpen(true)}>
            <Plus aria-hidden="true" />
            Add Vehicle
          </Button>
        </div>
      </div>
      <VehiclesTable />
      {addOpen && <VehicleFormDialog onOpenChange={setAddOpen} />}
    </div>
  )
}
