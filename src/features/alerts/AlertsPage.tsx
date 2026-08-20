import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FilterDropdown } from '@/shared/components/filter-dropdown/FilterDropdown'
import { useUrlFilters } from '@/shared/hooks/use-url-filters'
import { alertStatusSchema, alertTypeSchema } from '@/mock-api/schemas/alert'
import { ALERT_STATUS_CONFIG } from './alert-status-config'
import { alertsFiltersSchema } from './alerts-filters'
import { AlertsTable } from './components/AlertsTable'

const STATUS_ITEMS: Record<string, string> = {
  all: 'All statuses',
  ...Object.fromEntries(
    alertStatusSchema.options.map((status) => [status, ALERT_STATUS_CONFIG[status].label]),
  ),
}

const TYPE_ITEMS: Record<string, string> = {
  all: 'All types',
  ...Object.fromEntries(
    alertTypeSchema.options.map((type) => [
      type,
      type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    ]),
  ),
}

export function AlertsPage() {
  const { filters, setFilters } = useUrlFilters(alertsFiltersSchema)
  const category = filters.category || 'delivery'

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Alerts</h1>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Search</span>
            <Input
              placeholder="Search alert messages…"
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
        </div>
      </div>

      <Tabs value={category} onValueChange={(v) => v && setFilters({ category: String(v) })}>
        <TabsList>
          <TabsTrigger value="delivery">Delivery info</TabsTrigger>
          <TabsTrigger value="fleet">Fleet info</TabsTrigger>
        </TabsList>
      </Tabs>

      <AlertsTable category={category} />
    </div>
  )
}
