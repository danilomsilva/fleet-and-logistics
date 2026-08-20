import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FilterDropdown } from '@/shared/components/filter-dropdown/FilterDropdown'
import { useUrlFilters } from '@/shared/hooks/use-url-filters'
import { useDrivers } from '@/features/drivers/hooks/useDrivers'
import { useVehicles } from '@/features/vehicles/hooks/useVehicles'
import { deliveryPrioritySchema, deliveryStatusSchema } from '@/mock-api/schemas/delivery'
import { DELIVERY_PRIORITY_CONFIG, DELIVERY_STATUS_CONFIG } from './delivery-status-config'
import { deliveriesFiltersSchema } from './deliveries-filters'
import { DeliveriesTable } from './components/DeliveriesTable'
import { DeliveryFormDialog } from './components/DeliveryFormDialog'

const STATUS_ITEMS: Record<string, string> = {
  all: 'All statuses',
  ...Object.fromEntries(
    deliveryStatusSchema.options.map((status) => [status, DELIVERY_STATUS_CONFIG[status].label]),
  ),
}

const PRIORITY_ITEMS: Record<string, string> = {
  all: 'All priorities',
  ...Object.fromEntries(
    deliveryPrioritySchema.options.map((priority) => [
      priority,
      DELIVERY_PRIORITY_CONFIG[priority].label,
    ]),
  ),
}

export function DeliveriesPage() {
  const [addOpen, setAddOpen] = useState(false)
  const { filters, setFilters } = useUrlFilters(deliveriesFiltersSchema)

  const { data: driversData } = useDrivers({ pageSize: 200 })
  const { data: vehiclesData } = useVehicles({ pageSize: 200 })
  const driverItems: Record<string, string> = {
    all: 'All drivers',
    ...Object.fromEntries((driversData?.data ?? []).map((driver) => [driver.id, driver.name])),
  }
  const vehicleItems: Record<string, string> = {
    all: 'All vehicles',
    ...Object.fromEntries((vehiclesData?.data ?? []).map((vehicle) => [vehicle.id, vehicle.name])),
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Deliveries</h1>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Search</span>
            <Input
              placeholder="Search deliveries or destination…"
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
                label: 'Driver',
                value: filters.driverId || 'all',
                onValueChange: (value) => setFilters({ driverId: value === 'all' ? '' : value }),
                items: driverItems,
              },
              {
                label: 'Vehicle',
                value: filters.vehicleId || 'all',
                onValueChange: (value) => setFilters({ vehicleId: value === 'all' ? '' : value }),
                items: vehicleItems,
              },
            ]}
          >
            <label htmlFor="delivery-date-filter" className="text-xs text-muted-foreground">
              Scheduled date
            </label>
            <Input
              id="delivery-date-filter"
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ date: e.target.value })}
            />
          </FilterDropdown>
          <Button onClick={() => setAddOpen(true)}>
            <Plus aria-hidden="true" />
            Add Delivery
          </Button>
        </div>
      </div>
      <DeliveriesTable />
      {addOpen && <DeliveryFormDialog onOpenChange={setAddOpen} />}
    </div>
  )
}
