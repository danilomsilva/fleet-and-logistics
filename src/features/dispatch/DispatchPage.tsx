import { useDeliveries } from '@/features/deliveries/hooks/useDeliveries'
import { DispatchMap } from './components/DispatchMap'
import { UnassignedDeliveriesPanel } from './components/UnassignedDeliveriesPanel'
import { AssignmentWizardDialog } from './components/AssignmentWizardDialog'
import { useDispatchWizard } from './dispatch-store'

export function DispatchPage() {
  const { data: deliveriesData } = useDeliveries({ status: 'new', pageSize: 100 })
  const open = useDispatchWizard((s) => s.open)

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Dispatch</h1>
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1fr_320px]">
        <DispatchMap
          unassignedDeliveries={deliveriesData?.data ?? []}
          onDeliveryMarkerClick={open}
        />
        <UnassignedDeliveriesPanel />
      </div>
      <AssignmentWizardDialog />
    </div>
  )
}
