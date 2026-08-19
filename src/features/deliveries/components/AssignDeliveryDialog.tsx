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

  const driverItems = Object.fromEntries(
    (driversData?.data ?? []).map((driver) => [driver.id, driver.name]),
  )
  const vehicleItems = Object.fromEntries(
    (vehiclesData?.data ?? []).map((vehicle) => [vehicle.id, vehicle.name]),
  )

  function handleConfirm() {
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
            Choose an available driver and a {requiredVehicleType} vehicle.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {driversData && driversData.data.length === 0 ? (
            <p className="text-sm text-muted-foreground">No available drivers right now.</p>
          ) : (
            <Select
              items={driverItems}
              value={driverId}
              onValueChange={(v) => setDriverId(v ?? '')}
            >
              <SelectTrigger className="w-full" aria-label="Driver">
                <SelectValue placeholder="Select driver" />
              </SelectTrigger>
              <SelectContent>
                {driversData?.data.map((driver) => (
                  <SelectItem key={driver.id} value={driver.id}>
                    {driver.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {vehiclesData && vehiclesData.data.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No available {requiredVehicleType} vehicles right now.
            </p>
          ) : (
            <Select
              items={vehicleItems}
              value={vehicleId}
              onValueChange={(v) => setVehicleId(v ?? '')}
            >
              <SelectTrigger className="w-full" aria-label="Vehicle">
                <SelectValue placeholder="Select vehicle" />
              </SelectTrigger>
              <SelectContent>
                {vehiclesData?.data.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.name}
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
