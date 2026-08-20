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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useVehicles } from '@/features/vehicles/hooks/useVehicles'
import { useCreateDriver } from '../hooks/useCreateDriver'
import { useUpdateDriver } from '../hooks/useUpdateDriver'
import { driverInputSchema, driverStatusSchema } from '@/mock-api/schemas/driver'
import type { Driver } from '@/mock-api/schemas/driver'
import { DRIVER_STATUS_CONFIG } from '../driver-status-config'

const STATUS_ITEMS: Record<string, string> = Object.fromEntries(
  driverStatusSchema.options.map((status) => [status, DRIVER_STATUS_CONFIG[status].label]),
)

const UNASSIGNED = 'unassigned'

export interface DriverFormDialogProps {
  /** Called with `false` to close. The caller should stop rendering this
   * component in response, so a fresh instance (and fresh form state) mounts
   * the next time it's opened — see DriversPage/DriverDetailPage. */
  onOpenChange: (open: boolean) => void
  /** Omit to create a new driver; pass an existing one to edit it. */
  driver?: Driver
}

export function DriverFormDialog({ onOpenChange, driver }: DriverFormDialogProps) {
  const isEdit = !!driver
  const { data: vehiclesData } = useVehicles({ pageSize: 200 })
  const createDriver = useCreateDriver()
  const updateDriver = useUpdateDriver()
  const isPending = createDriver.isPending || updateDriver.isPending

  const [name, setName] = useState(driver?.name ?? '')
  const [status, setStatus] = useState<string>(driver?.status ?? 'available')
  const [assignedVehicleId, setAssignedVehicleId] = useState(
    driver?.assignedVehicleId ?? UNASSIGNED,
  )

  // A vehicle can only ever be paired with one driver — only offer vehicles
  // that don't already have one, plus this driver's own current vehicle (if
  // editing), so their existing pairing doesn't just vanish from the list.
  // A vehicle isn't required, though — a driver can be added before one is
  // free and assigned later by editing them.
  const eligibleVehicles = (vehiclesData?.data ?? []).filter(
    (vehicle) => !vehicle.driverId || vehicle.driverId === driver?.id,
  )
  const vehicleItems: Record<string, string> = {
    [UNASSIGNED]: 'Unassigned',
    ...Object.fromEntries(eligibleVehicles.map((vehicle) => [vehicle.id, vehicle.name])),
  }

  function handleSubmit() {
    const parsed = driverInputSchema.safeParse({
      name,
      status,
      assignedVehicleId: assignedVehicleId === UNASSIGNED ? null : assignedVehicleId,
    })
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Please check the form.')
      return
    }

    const onSuccess = () => {
      toast.success(isEdit ? `${name} updated.` : `${name} added.`)
      onOpenChange(false)
    }
    const onError = () =>
      toast.error(isEdit ? "Couldn't update the driver." : "Couldn't add the driver.")

    if (isEdit) {
      updateDriver.mutate({ id: driver.id, input: parsed.data }, { onSuccess, onError })
    } else {
      createDriver.mutate(parsed.data, { onSuccess, onError })
    }
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit ${driver.name}` : 'Add Driver'}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update this driver's details." : 'Add a new driver.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="driver-name" className="text-sm font-medium">
              Name
            </label>
            <Input id="driver-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <span className="text-sm font-medium">Status</span>
            {isEdit ? (
              <Select items={STATUS_ITEMS} value={status} onValueChange={(v) => v && setStatus(v)}>
                <SelectTrigger className="w-full" aria-label="Driver status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_ITEMS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-muted-foreground">
                New drivers start as Available. You can change this after adding them.
              </p>
            )}
          </div>
          <div className="space-y-1">
            <span className="text-sm font-medium">Assigned vehicle</span>
            <Select
              items={vehicleItems}
              value={assignedVehicleId}
              onValueChange={(v) => v && setAssignedVehicleId(v)}
            >
              <SelectTrigger className="w-full" aria-label="Assigned vehicle">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(vehicleItems).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button disabled={isPending || !name} onClick={handleSubmit}>
            {isEdit ? 'Save changes' : 'Add Driver'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
