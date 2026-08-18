import { Button } from '@/components/ui/button'
import { EmptyState } from '@/shared/components/empty-state/EmptyState'
import { StatusBadge } from '@/shared/components/status-badge/StatusBadge'
import { PackageCheck } from 'lucide-react'
import { useDeliveries } from '@/features/deliveries/hooks/useDeliveries'
import { DELIVERY_PRIORITY_CONFIG } from '@/features/deliveries/delivery-status-config'
import { useDispatchWizard } from '../dispatch-store'

export function UnassignedDeliveriesPanel() {
  const { data, isLoading } = useDeliveries({ status: 'pending', pageSize: 100, sort: 'priority' })
  const open = useDispatchWizard((s) => s.open)

  const deliveries = data?.data ?? []

  return (
    <div className="flex h-full flex-col gap-3 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">Unassigned deliveries</h2>
        <span className="text-xs text-muted-foreground">{data?.total ?? 0}</span>
      </div>

      {!isLoading && deliveries.length === 0 ? (
        <EmptyState
          icon={PackageCheck}
          title="Nothing to assign"
          description="All deliveries are assigned or in progress."
        />
      ) : (
        <ul className="flex-1 space-y-2 overflow-y-auto">
          {deliveries.map((delivery) => {
            const priority = DELIVERY_PRIORITY_CONFIG[delivery.priority]
            return (
              <li
                key={delivery.id}
                className="flex items-center justify-between gap-2 rounded-md border p-2.5"
              >
                <div className="min-w-0 space-y-1">
                  <p className="truncate text-sm font-medium">{delivery.id}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {delivery.destination.label}
                  </p>
                  <StatusBadge label={priority.label} tone={priority.tone} icon={priority.icon} />
                </div>
                <Button size="sm" onClick={() => open(delivery.id)}>
                  Assign
                </Button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
