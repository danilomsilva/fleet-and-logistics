import { useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDrivers } from '@/features/drivers/hooks/useDrivers'
import { useVehicles } from '@/features/vehicles/hooks/useVehicles'
import type { VehicleType } from '@/mock-api/schemas/vehicle'
import { useAssignDelivery } from '../hooks/useAssignDelivery'

interface AssignDeliveryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deliveryId: string
  requiredVehicleType: VehicleType
}

export function AssignDeliveryDialog({
  open,
  onOpenChange,
  deliveryId,
  requiredVehicleType,
}: AssignDeliveryDialogProps) {
  const [driverId, setDriverId] = useState('')
  const [vehicleId, setVehicleId] = useState('')
  const { data: driversData } = useDrivers({ status: 'available', pageSize: 200 })
  const { data: vehiclesData } = useVehicles({
    status: 'available',
    type: requiredVehicleType,
    pageSize: 200,
  })
  const assignMutation = useAssignDelivery()

  // Every driver already has a vehicle assigned to them — picking a driver is
  // enough, their own vehicle comes along automatically. Only drivers whose
  // own vehicle is available and of the right type are selectable. The
  // vehicle id is captured at selection time (not re-derived at confirm),
  // so it can't be affected by the driver/vehicle queries refetching while
  // the dialog is open.
  const eligibleVehicleIds = new Set((vehiclesData?.data ?? []).map((v) => v.id))
  const eligibleDrivers = (driversData?.data ?? []).filter(
    (d) => d.assignedVehicleId && eligibleVehicleIds.has(d.assignedVehicleId),
  )
  const driverItems = Object.fromEntries(eligibleDrivers.map((driver) => [driver.id, driver.name]))

  function handleSelectDriver(id: string) {
    setDriverId(id)
    setVehicleId(eligibleDrivers.find((d) => d.id === id)?.assignedVehicleId ?? '')
  }

  function handleConfirm() {
    if (!driverId || !vehicleId) return
    assignMutation.mutate(
      { deliveryId, driverId, vehicleId },
      {
        onSuccess: () => {
          toast.success(`Delivery ${deliveryId} assigned successfully.`)
          onOpenChange(false)
          setDriverId('')
          setVehicleId('')
        },
        onError: () => toast.error('Failed to assign delivery. Please try again.'),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign delivery</DialogTitle>
          <DialogDescription>
            Choose a driver — their assigned {requiredVehicleType} vehicle will be used.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {driversData && vehiclesData && eligibleDrivers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No drivers with an available {requiredVehicleType} vehicle right now.
            </p>
          ) : (
            <Select
              items={driverItems}
              value={driverId}
              onValueChange={(v) => v && handleSelectDriver(v)}
            >
              <SelectTrigger className="w-full" aria-label="Driver">
                <SelectValue placeholder="Select driver" />
              </SelectTrigger>
              <SelectContent>
                {eligibleDrivers.map((driver) => (
                  <SelectItem key={driver.id} value={driver.id}>
                    {driver.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button
            disabled={!driverId || !vehicleId || assignMutation.isPending}
            onClick={handleConfirm}
          >
            Confirm assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
