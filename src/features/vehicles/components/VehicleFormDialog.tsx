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
import { useDrivers } from '@/features/drivers/hooks/useDrivers'
import { useCreateVehicle } from '../hooks/useCreateVehicle'
import { useUpdateVehicle } from '../hooks/useUpdateVehicle'
import {
  vehicleInputSchema,
  vehicleStatusSchema,
  vehicleTypeSchema,
} from '@/mock-api/schemas/vehicle'
import type { Vehicle } from '@/mock-api/schemas/vehicle'

const UNASSIGNED = 'unassigned'

export interface VehicleFormDialogProps {
  /** Called with `false` to close. The caller should stop rendering this
   * component in response, so a fresh instance (and fresh form state) mounts
   * the next time it's opened — see VehiclesPage/VehicleDetailPage. */
  onOpenChange: (open: boolean) => void
  /** Omit to create a new vehicle; pass an existing one to edit it. */
  vehicle?: Vehicle
}

export function VehicleFormDialog({ onOpenChange, vehicle }: VehicleFormDialogProps) {
  const isEdit = !!vehicle
  const { data: driversData } = useDrivers({ pageSize: 200 })
  const createVehicle = useCreateVehicle()
  const updateVehicle = useUpdateVehicle()
  const isPending = createVehicle.isPending || updateVehicle.isPending

  const [name, setName] = useState(vehicle?.name ?? '')
  const [registration, setRegistration] = useState(vehicle?.registration ?? '')
  const [type, setType] = useState<string>(vehicle?.type ?? 'van')
  const [status, setStatus] = useState<string>(vehicle?.status ?? 'available')
  const [driverId, setDriverId] = useState(vehicle?.driverId ?? UNASSIGNED)
  const [mileage, setMileage] = useState(String(vehicle?.mileage ?? 0))

  function handleSubmit() {
    const parsed = vehicleInputSchema.safeParse({
      name,
      registration,
      type,
      status,
      driverId: driverId === UNASSIGNED ? null : driverId,
      mileage: Number(mileage),
    })
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Please check the form.')
      return
    }

    const onSuccess = () => {
      toast.success(isEdit ? `${name} updated.` : `${name} added to the fleet.`)
      onOpenChange(false)
    }
    const onError = () =>
      toast.error(isEdit ? "Couldn't update the vehicle." : "Couldn't add the vehicle.")

    if (isEdit) {
      updateVehicle.mutate({ id: vehicle.id, input: parsed.data }, { onSuccess, onError })
    } else {
      createVehicle.mutate(parsed.data, { onSuccess, onError })
    }
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit ${vehicle.name}` : 'Add vehicle'}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update this vehicle's details." : 'Add a new vehicle to the fleet.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="vehicle-name" className="text-sm font-medium">
              Name
            </label>
            <Input id="vehicle-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label htmlFor="vehicle-registration" className="text-sm font-medium">
              Registration
            </label>
            <Input
              id="vehicle-registration"
              value={registration}
              onChange={(e) => setRegistration(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-sm font-medium">Type</span>
              <Select value={type} onValueChange={(v) => v && setType(v)}>
                <SelectTrigger className="w-full" aria-label="Vehicle type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {vehicleTypeSchema.options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <span className="text-sm font-medium">Status</span>
              <Select value={status} onValueChange={(v) => v && setStatus(v)}>
                <SelectTrigger className="w-full" aria-label="Vehicle status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {vehicleStatusSchema.options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-sm font-medium">Driver</span>
            <Select value={driverId} onValueChange={(v) => v && setDriverId(v)}>
              <SelectTrigger className="w-full" aria-label="Assigned driver">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                {driversData?.data.map((driver) => (
                  <SelectItem key={driver.id} value={driver.id}>
                    {driver.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label htmlFor="vehicle-mileage" className="text-sm font-medium">
              Mileage (km)
            </label>
            <Input
              id="vehicle-mileage"
              type="number"
              min={0}
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button disabled={isPending || !name || !registration} onClick={handleSubmit}>
            {isEdit ? 'Save changes' : 'Add vehicle'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
