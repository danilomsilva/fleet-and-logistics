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
import { useCreateServiceRecord } from '../hooks/useCreateServiceRecord'
import { useUpdateServiceRecord } from '../hooks/useUpdateServiceRecord'
import {
  serviceInputSchema,
  servicePrioritySchema,
  serviceTypeSchema,
} from '@/mock-api/schemas/service'
import type { ServiceRecord } from '@/mock-api/schemas/service'
import { SERVICE_PRIORITY_CONFIG } from '../service-status-config'

const TYPE_ITEMS: Record<string, string> = Object.fromEntries(
  serviceTypeSchema.options.map((type) => [
    type,
    type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  ]),
)

const PRIORITY_ITEMS: Record<string, string> = Object.fromEntries(
  servicePrioritySchema.options.map((priority) => [
    priority,
    SERVICE_PRIORITY_CONFIG[priority].label,
  ]),
)

export interface ServiceFormDialogProps {
  /** Called with `false` to close. The caller should stop rendering this
   * component in response, so a fresh instance (and fresh form state) mounts
   * the next time it's opened — see ServicesPage/ServiceDetailPage. */
  onOpenChange: (open: boolean) => void
  /** Omit to create a new record; pass an existing one to edit it. */
  record?: ServiceRecord
}

function toDateInputValue(iso: string): string {
  return iso.slice(0, 10)
}

export function ServiceFormDialog({ onOpenChange, record }: ServiceFormDialogProps) {
  const isEdit = !!record
  const { data: vehiclesData } = useVehicles({ pageSize: 200 })
  const createRecord = useCreateServiceRecord()
  const updateRecord = useUpdateServiceRecord()
  const isPending = createRecord.isPending || updateRecord.isPending

  const [vehicleId, setVehicleId] = useState(record?.vehicleId ?? '')
  const vehicleItems: Record<string, string> = Object.fromEntries(
    (vehiclesData?.data ?? []).map((vehicle) => [vehicle.id, vehicle.name]),
  )
  const [serviceType, setServiceType] = useState<string>(
    record?.serviceType ?? serviceTypeSchema.options[0],
  )
  const [priority, setPriority] = useState<string>(record?.priority ?? 'medium')
  const [scheduledDate, setScheduledDate] = useState(
    record ? toDateInputValue(record.scheduledDate) : '',
  )
  const [mileage, setMileage] = useState(String(record?.mileage ?? 0))
  const [description, setDescription] = useState(record?.description ?? '')
  const [notes, setNotes] = useState(record?.notes ?? '')

  function handleSubmit() {
    const parsed = serviceInputSchema.safeParse({
      vehicleId,
      serviceType,
      priority,
      scheduledDate: scheduledDate ? new Date(scheduledDate).toISOString() : '',
      mileage: Number(mileage),
      description,
      notes,
    })
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Please check the form.')
      return
    }

    const onSuccess = () => {
      toast.success(isEdit ? `${record!.id} updated.` : 'Service record added.')
      onOpenChange(false)
    }
    const onError = () =>
      toast.error(isEdit ? "Couldn't update the record." : "Couldn't add the record.")

    if (isEdit) {
      updateRecord.mutate({ id: record.id, input: parsed.data }, { onSuccess, onError })
    } else {
      createRecord.mutate(parsed.data, { onSuccess, onError })
    }
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit ${record.id}` : 'Add Service Record'}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update this service record's details." : 'Schedule a new service record.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <span className="text-sm font-medium">Vehicle</span>
            <Select
              items={vehicleItems}
              value={vehicleId}
              onValueChange={(v) => v && setVehicleId(v)}
            >
              <SelectTrigger className="w-full" aria-label="Vehicle">
                <SelectValue placeholder="Select a vehicle" />
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-sm font-medium">Type</span>
              <Select
                items={TYPE_ITEMS}
                value={serviceType}
                onValueChange={(v) => v && setServiceType(v)}
              >
                <SelectTrigger className="w-full" aria-label="Service type">
                  <SelectValue />
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
            <div className="space-y-1">
              <span className="text-sm font-medium">Priority</span>
              <Select
                items={PRIORITY_ITEMS}
                value={priority}
                onValueChange={(v) => v && setPriority(v)}
              >
                <SelectTrigger className="w-full" aria-label="Priority">
                  <SelectValue />
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="service-scheduled-date" className="text-sm font-medium">
                Scheduled date
              </label>
              <Input
                id="service-scheduled-date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="service-mileage" className="text-sm font-medium">
                Mileage (km)
              </label>
              <Input
                id="service-mileage"
                type="number"
                min={0}
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label htmlFor="service-description" className="text-sm font-medium">
              Description
            </label>
            <Input
              id="service-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="service-notes" className="text-sm font-medium">
              Notes
            </label>
            <Input id="service-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button
            disabled={isPending || !vehicleId || !scheduledDate || !description}
            onClick={handleSubmit}
          >
            {isEdit ? 'Save changes' : 'Add Record'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
