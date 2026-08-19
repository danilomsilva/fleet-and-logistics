import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUrlFilters } from '@/shared/hooks/use-url-filters'
import { alertPrioritySchema, alertStatusSchema, alertTypeSchema } from '@/mock-api/schemas/alert'
import { ALERT_PRIORITY_CONFIG, ALERT_STATUS_CONFIG } from './alert-status-config'
import { alertsFiltersSchema } from './alerts-filters'
import { AlertsTable } from './components/AlertsTable'

const STATUS_ITEMS: Record<string, string> = {
  all: 'All statuses',
  ...Object.fromEntries(
    alertStatusSchema.options.map((status) => [status, ALERT_STATUS_CONFIG[status].label]),
  ),
}

const PRIORITY_ITEMS: Record<string, string> = {
  all: 'All priorities',
  ...Object.fromEntries(
    alertPrioritySchema.options.map((priority) => [
      priority,
      ALERT_PRIORITY_CONFIG[priority].label,
    ]),
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
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Search</span>
            <Input
              placeholder="Search alert messages…"
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
              <SelectTrigger className="w-44" aria-label="Filter by type">
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
