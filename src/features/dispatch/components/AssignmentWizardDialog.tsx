import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EmptyState } from '@/shared/components/empty-state/EmptyState'
import { cn } from '@/lib/utils'
import { useDelivery } from '@/features/deliveries/hooks/useDelivery'
import { useDrivers } from '@/features/drivers/hooks/useDrivers'
import { useVehicles } from '@/features/vehicles/hooks/useVehicles'
import { useAssignDelivery } from '@/features/deliveries/hooks/useAssignDelivery'
import { useDispatchWizard } from '../dispatch-store'

const STEPS = [
  { key: 'driver', label: 'Driver' },
  { key: 'review', label: 'Review' },
] as const

export function AssignmentWizardDialog() {
  const { isOpen, step, deliveryId, driverId, vehicleId, close, selectDriver } = useDispatchWizard()

  const { data: delivery } = useDelivery(deliveryId ?? '')
  const { data: driversData } = useDrivers({ status: 'available', pageSize: 200 })
  const { data: vehiclesData } = useVehicles({
    status: 'available',
    type: delivery?.requiredVehicleType,
    pageSize: 200,
  })
  const assignMutation = useAssignDelivery()

  // Every driver already has a vehicle assigned to them — the dispatcher only
  // picks a driver, and that vehicle comes along automatically. Only drivers
  // whose own vehicle is available and of the right type are selectable.
  const eligibleVehicleIds = new Set((vehiclesData?.data ?? []).map((v) => v.id))
  const eligibleDrivers = (driversData?.data ?? []).filter(
    (d) => d.assignedVehicleId && eligibleVehicleIds.has(d.assignedVehicleId),
  )

  const selectedDriver = driversData?.data.find((d) => d.id === driverId)
  const selectedVehicle = vehiclesData?.data.find((v) => v.id === vehicleId)

  function handleConfirm() {
    if (!deliveryId || !driverId || !vehicleId) return
    assignMutation.mutate(
      { deliveryId, driverId, vehicleId },
      {
        onSuccess: () => {
          toast.success(`Delivery ${deliveryId} assigned successfully.`)
          close()
        },
        onError: () => toast.error('Failed to assign delivery. Please try again.'),
      },
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign {deliveryId}</DialogTitle>
          <DialogDescription>
            {delivery
              ? `To ${delivery.destination.label}, requires a ${delivery.requiredVehicleType}.`
              : 'Loading delivery details…'}
          </DialogDescription>
        </DialogHeader>

        <ol className="flex items-center gap-2 text-xs text-muted-foreground" aria-label="Steps">
          {STEPS.map((s, i) => (
            <li
              key={s.key}
              className={cn(
                'flex items-center gap-1',
                s.key === step && 'font-medium text-foreground',
              )}
            >
              {i > 0 && <span aria-hidden="true">→</span>}
              <span>{s.label}</span>
            </li>
          ))}
        </ol>

        {step === 'driver' &&
          (driversData && vehiclesData && eligibleDrivers.length === 0 ? (
            <EmptyState
              title={`No drivers with an available ${delivery?.requiredVehicleType ?? ''} vehicle right now.`}
            />
          ) : (
            <ul className="max-h-64 space-y-1 overflow-y-auto">
              {eligibleDrivers.map((driver) => (
                <li key={driver.id}>
                  <button
                    type="button"
                    onClick={() => selectDriver(driver.id, driver.assignedVehicleId!)}
                    className="w-full rounded-md border px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {driver.name}
                  </button>
                </li>
              ))}
            </ul>
          ))}

        {step === 'review' && (
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Delivery:</span> {deliveryId}
            </p>
            <p>
              <span className="text-muted-foreground">Driver:</span> {selectedDriver?.name}
            </p>
            <p>
              <span className="text-muted-foreground">Vehicle:</span> {selectedVehicle?.name}
            </p>
          </div>
        )}

        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          {step === 'review' && (
            <Button disabled={assignMutation.isPending} onClick={handleConfirm}>
              Confirm assignment
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
