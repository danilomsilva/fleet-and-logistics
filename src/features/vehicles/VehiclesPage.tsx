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
            <span className="text-xs text-muted-foreground">Type</span>
            <Select
              items={TYPE_ITEMS}
              value={filters.type || 'all'}
              onValueChange={(value) =>
                setFilters({ type: !value || value === 'all' ? '' : value })
              }
            >
              <SelectTrigger className="w-40" aria-label="Filter by type">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TYPE_ITEMS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
