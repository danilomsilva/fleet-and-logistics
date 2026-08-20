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
import { driverStatusSchema } from '@/mock-api/schemas/driver'
import { DRIVER_STATUS_CONFIG } from './driver-status-config'
import { driversFiltersSchema } from './drivers-filters'
import { DriversTable } from './components/DriversTable'
import { DriverFormDialog } from './components/DriverFormDialog'

const STATUS_ITEMS: Record<string, string> = {
  all: 'All statuses',
  ...Object.fromEntries(
    driverStatusSchema.options.map((status) => [status, DRIVER_STATUS_CONFIG[status].label]),
  ),
}

export function DriversPage() {
  const [addOpen, setAddOpen] = useState(false)
  const { filters, setFilters } = useUrlFilters(driversFiltersSchema)

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Drivers</h1>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Search</span>
            <Input
              placeholder="Search drivers…"
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
          <Button onClick={() => setAddOpen(true)}>
            <Plus aria-hidden="true" />
            Add Driver
          </Button>
        </div>
      </div>
      <DriversTable />
      {addOpen && <DriverFormDialog onOpenChange={setAddOpen} />}
    </div>
  )
}
